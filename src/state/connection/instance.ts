import SuiSDK, { NetworkType as SuiNetworkType } from '@animeswap.org/sui-v1-sdk'
import SDK, {
  AptosCoinInfoResource,
  AptosCoinStoreResource,
  AptosLedgerInfo,
  AptosResource,
  AptosTransaction,
  Decimal,
  NetworkType,
  SwapPoolResource,
  Utils,
} from '@animeswap.org/v1-sdk'
import { Connection, JsonRpcProvider } from '@mysten/sui.js'
import { AptosClient } from 'aptos'
import { CHAIN_INFO } from 'constants/chainInfo'
import { CHAIN_IDS_TO_SDK_NETWORK, isSuiChain, SUI_CHAIN_IDS_TO_SDK_NETWORK, SupportedChainId } from 'constants/chains'
import { Pair } from 'hooks/common/Pair'
import store from 'state'
import { addCoin, addTempCoin, setAllPairs, updatePair } from 'state/user/reducer'
import { resetCoinBalances, resetLpBalances, setCoinBalances } from 'state/wallets/reducer'

import { ConnectionType, getRPCURL } from './reducer'

class ConnectionInstance {
  private static aptosClient: AptosClient
  private static sdk: SDK
  private static suiClient: JsonRpcProvider
  private static suiSDK: SuiSDK

  public static getAptosClient(): AptosClient {
    if (!ConnectionInstance.aptosClient) {
      const state = store.getState()
      ConnectionInstance.aptosClient = new AptosClient(
        getRPCURL(state.connection.currentConnection, state.user.chainId)
      )
    }
    return ConnectionInstance.aptosClient
  }

  public static renewAptosClient(connection: ConnectionType, chainId: SupportedChainId) {
    ConnectionInstance.aptosClient = new AptosClient(getRPCURL(connection, chainId))
  }

  public static getSDK(): SDK {
    if (!ConnectionInstance.sdk) {
      const state = store.getState()
      const networkType: NetworkType = CHAIN_IDS_TO_SDK_NETWORK[state.user.chainId]
      ConnectionInstance.sdk = new SDK(getRPCURL(state.connection.currentConnection, state.user.chainId), networkType)
    }
    return ConnectionInstance.sdk
  }

  public static renewSDK(connection: ConnectionType, chainId: SupportedChainId) {
    const networkType: NetworkType = CHAIN_IDS_TO_SDK_NETWORK[chainId]
    ConnectionInstance.sdk = new SDK(getRPCURL(connection, chainId), networkType)
  }

  public static async syncAccountResources(account: string, chainId: SupportedChainId, poolPair = false) {
    if (isSuiChain(chainId)) {
      return this.syncSuiAccountResources(account, chainId, poolPair)
    }
    try {
      if (!account) return undefined
      const aptosClient = ConnectionInstance.getAptosClient()
      const res: AptosResource<any>[] = await aptosClient.getAccountResources(account)
      const coinStore = this.getSDK().networkOptions.modules.CoinStore
      const lpCoinNamespace = Utils.composeLPCoinType(this.getSDK().networkOptions.modules.ResourceAccountAddress)
      const coinBalances = {}
      const lpBalances = {}
      for (const resource of res) {
        const type = resource.type
        // coin balance filter
        if (type.startsWith(`${coinStore}<`)) {
          const coinType = type.substring(coinStore.length + 1, type.length - 1)
          coinBalances[coinType] = resource.data.coin.value
          // LP balance filter
          if (coinType.startsWith(`${lpCoinNamespace}<`)) {
            const lpCoinType = coinType.substring(lpCoinNamespace.length + 1, coinType.length - 1)
            lpBalances[lpCoinType] = resource.data.coin.value
            if (poolPair) {
              const [coinX, coinY] = lpCoinType.split(', ')
              this.getPair(coinX, coinY)
            }
          }
        }
      }
      store.dispatch(resetCoinBalances({ coinBalances }))
      store.dispatch(resetLpBalances({ lpBalances }))
      return res
    } catch (error) {
      store.dispatch(resetCoinBalances({ coinBalances: {} }))
      store.dispatch(resetLpBalances({ lpBalances: {} }))
      return undefined
    }
  }

  public static async getAccountResource(account: string, type: string) {
    try {
      if (!account || !type) {
        return undefined
      }
      const aptosClient = ConnectionInstance.getAptosClient()
      const res: AptosResource<any> = await aptosClient.getAccountResource(account, type)
      const data = res.data
      return data
    } catch (error) {
      return undefined
    }
  }

  public static async getCoinBalance(chainId: SupportedChainId, account: string, type: string) {
    if (isSuiChain(chainId)) {
      return this.getSuiCoinBalance(chainId, account, type)
    }
    try {
      if (!account || !type) {
        return undefined
      }
      console.log(`getCoinBalance ${account} ${type}`)
      const coinStore = this.getSDK().networkOptions.modules.CoinStore
      const res: AptosCoinStoreResource = await ConnectionInstance.getAccountResource(
        account,
        Utils.composeCoinStore(coinStore, type)
      )
      console.log(`getCoinBalance return`, res)
      const amount = res.coin.value
      store.dispatch(setCoinBalances({ coinBalances: { [type]: amount } }))
      return amount
    } catch (error) {
      return undefined
    }
  }

  // sync from pool pair
  public static async getPair(coinX: string, coinY: string): Promise<Pair> {
    try {
      if (!coinX || !coinY) return undefined
      const modules = this.getSDK().networkOptions.modules
      const lpCoin = Utils.composeLPCoin(modules.ResourceAccountAddress, coinX, coinY)
      const lpType = Utils.composeLP(modules.Scripts, coinX, coinY)
      const getLPCoinInfo: AptosCoinInfoResource = await ConnectionInstance.getAccountResource(
        modules.ResourceAccountAddress,
        Utils.composeType(modules.CoinInfo, [lpCoin])
      )
      const getLPPool: SwapPoolResource = await ConnectionInstance.getAccountResource(
        modules.ResourceAccountAddress,
        lpType
      )
      const [lpCoinInfo, lpPool] = await Promise.all([getLPCoinInfo, getLPPool])
      // pair not exist
      if (lpCoinInfo == undefined || lpPool == undefined) {
        return null
      }
      const lpTotal = lpCoinInfo.supply.vec[0].integer.vec[0].value
      const coinXReserve = lpPool.coin_x_reserve.value
      const coinYReserve = lpPool.coin_y_reserve.value
      const pair: Pair = {
        coinX,
        coinY,
        lpTotal,
        coinXReserve,
        coinYReserve,
      }
      store.dispatch(updatePair({ pair }))
      return pair
    } catch (error) {
      store.dispatch(updatePair({ pair: undefined }))
      return undefined
    }
  }

  public static async getAllPair(): Promise<{ [pairKey: string]: Pair }> {
    try {
      const sdk = this.getSDK()
      const pairs: { [pairKey: string]: Pair } = {}
      const aptosClient = ConnectionInstance.getAptosClient()
      const modules = sdk.networkOptions.modules
      const ledgerInfo = await sdk.resources.fetchLedgerInfo<AptosLedgerInfo>()
      // APR code
      const timestampNow = ledgerInfo.ledger_timestamp
      const currentLedgerVersion = ledgerInfo.ledger_version
      const oldestLedgerVersion = ledgerInfo.oldest_ledger_version
      const queryDeltaVersion = Utils.d(1e6) // APR window
      const queryLedgerVersion = Utils.d(currentLedgerVersion).sub(queryDeltaVersion).gte(Utils.d(oldestLedgerVersion))
        ? Utils.d(currentLedgerVersion).sub(queryDeltaVersion)
        : Utils.d(oldestLedgerVersion)

      // const poolResources: AptosResource<any>[]
      const task1: Promise<AptosResource<any>[]> = aptosClient.getAccountResources(modules.ResourceAccountAddress)
      // const poolResourcesLedger: AptosResource<any>[]
      const task2: Promise<AptosResource<any>[]> = this.sdk.resources.fetchAccountResources<unknown>(
        modules.ResourceAccountAddress,
        BigInt(queryLedgerVersion.toString())
      )
      // txn
      const task3: Promise<AptosTransaction> = this.sdk.resources.fetchTransactionByVersion<AptosTransaction>(
        BigInt(queryLedgerVersion.toString())
      )
      const [poolResources, poolResourcesLedger, txn] = await Promise.all([task1, task2, task3])

      // pass second params, this call has no network call
      const coinX2coinY2DecimalCurrent = await sdk.swap.getPricePerLPCoinBatch(undefined, poolResources)
      // pass second params, this call has no network call
      const coinX2coinY2DecimalPast = await sdk.swap.getPricePerLPCoinBatch(
        BigInt(queryLedgerVersion.toString()),
        poolResourcesLedger
      )
      const deltaTimestamp = Utils.d(timestampNow).sub(Utils.d(txn.timestamp))

      // parse coinX, coinY, LP, reserve
      for (const resource of poolResources) {
        const coinInfoPrefix = `${modules.CoinInfo}<${modules.ResourceAccountAddress}::LPCoinV1::LPCoin<`
        const poolPrefix = `${modules.Scripts}::LiquidityPool<`
        if (resource.type.startsWith(coinInfoPrefix)) {
          const pairKey = resource.type.substring(coinInfoPrefix.length, resource.type.length - 2)
          const [coinX, coinY] = pairKey.split(', ')
          if (pairs[pairKey]) {
            pairs[pairKey].lpTotal = resource.data.supply.vec[0].integer.vec[0].value
          } else {
            pairs[pairKey] = {
              coinX,
              coinY,
              coinXReserve: '0',
              coinYReserve: '0',
              lpTotal: resource.data.supply.vec[0].integer.vec[0].value,
            }
          }
          continue
        }
        if (resource.type.startsWith(poolPrefix)) {
          const pairKey = resource.type.substring(poolPrefix.length, resource.type.length - 1)
          if (pairs[pairKey]) {
            pairs[pairKey].coinXReserve = resource.data.coin_x_reserve.value
            pairs[pairKey].coinYReserve = resource.data.coin_y_reserve.value
          } else {
            const [coinX, coinY] = pairKey.split(', ')
            pairs[pairKey] = {
              coinX,
              coinY,
              lpTotal: '0',
              coinXReserve: resource.data.coin_x_reserve.value,
              coinYReserve: resource.data.coin_y_reserve.value,
            }
          }
          continue
        }
      }

      // write APR
      for (const key of Object.keys(coinX2coinY2DecimalCurrent)) {
        const base = coinX2coinY2DecimalPast[key]
        if (base) {
          pairs[key].APR = coinX2coinY2DecimalCurrent[key]
            .sub(base)
            .div(base)
            .mul(Utils.YEAR_NS)
            .div(deltaTimestamp)
            .toNumber()
        } else {
          pairs[key].APR = NaN
        }
      }
      return pairs
    } catch (error) {
      return {}
    }
  }

  public static async addCoin(address: string, chainId: SupportedChainId) {
    try {
      // sidecase: bypass default coin when SUI
      if (isSuiChain(chainId)) {
        if (
          CHAIN_INFO[SupportedChainId.APTOS].nativeCoin.address === address ||
          CHAIN_INFO[SupportedChainId.APTOS].defaultBuyCoin.address === address
        ) {
          return
        }
      }
      const splits = address.split('::')
      const account = splits[0]
      const coin: AptosCoinInfoResource = await this.getAccountResource(account, `0x1::coin::CoinInfo<${address}>`)
      if (coin) {
        store.dispatch(
          addCoin({
            coin: {
              address,
              decimals: coin.decimals,
              symbol: coin.symbol,
              name: coin.name,
            },
          })
        )
      }
    } catch (error) {
      console.error('addCoin', error)
    }
  }

  public static async addTempCoin(address: string) {
    try {
      const splits = address.split('::')
      const account = splits[0]
      const coin: AptosCoinInfoResource = await this.getAccountResource(account, `0x1::coin::CoinInfo<${address}>`)
      if (coin) {
        store.dispatch(
          addTempCoin({
            tempCoin: {
              address,
              decimals: coin.decimals,
              symbol: coin.symbol,
              name: coin.name,
            },
          })
        )
      }
    } catch (error) {
      console.error('addCoin', error)
    }
  }

  public static getSuiClient(): JsonRpcProvider {
    if (!ConnectionInstance.suiClient) {
      const state = store.getState()
      const suiConnection = new Connection({
        fullnode: getRPCURL(state.connection.currentConnection, state.user.chainId),
      })
      ConnectionInstance.suiClient = new JsonRpcProvider(suiConnection)
    }
    return ConnectionInstance.suiClient
  }

  public static renewSuiClient(connection: ConnectionType, chainId: SupportedChainId) {
    const suiConnection = new Connection({
      fullnode: getRPCURL(connection, chainId),
    })
    ConnectionInstance.suiClient = new JsonRpcProvider(suiConnection)
  }

  public static getSuiSDK() {
    if (!ConnectionInstance.suiSDK) {
      const state = store.getState()
      const networkType: SuiNetworkType = SUI_CHAIN_IDS_TO_SDK_NETWORK[state.user.chainId]
      ConnectionInstance.suiSDK = new SuiSDK(networkType)
    }
    return ConnectionInstance.suiSDK
  }

  public static renewSuiSDK(connection: ConnectionType, chainId: SupportedChainId) {
    const networkType: SuiNetworkType = SUI_CHAIN_IDS_TO_SDK_NETWORK[chainId]
    ConnectionInstance.suiSDK = new SuiSDK(networkType)
  }

  public static async syncSuiAccountResources(account: string, chainId: SupportedChainId, poolPair = false) {
    try {
      if (!account) return undefined
      const suiClient = ConnectionInstance.getSuiClient()
      const res = await suiClient.getAllBalances(account)
      const coinBalances = {}
      const lpBalances = {}
      for (const resource of res) {
        const type = resource.coinType
        coinBalances[type] = resource.totalBalance
        // TODO[Azard]: sync LP balance
      }
      store.dispatch(resetCoinBalances({ coinBalances }))
      store.dispatch(resetLpBalances({ lpBalances }))
      return undefined
    } catch (error) {
      store.dispatch(resetCoinBalances({ coinBalances: {} }))
      store.dispatch(resetLpBalances({ lpBalances: {} }))
      return undefined
    }
  }

  public static async getSuiCoinBalance(chainId: SupportedChainId, account: string, type: string) {
    try {
      if (!account || !type) {
        return undefined
      }
      console.log(`getSuiCoinBalance ${account} ${type}`)
      const suiClient = ConnectionInstance.getSuiClient()
      const res = await suiClient.getBalance(account, type)
      console.log(`getSuiCoinBalance return`, res)
      const amount = res.totalBalance
      store.dispatch(setCoinBalances({ coinBalances: { [type]: amount.toString() } }))
      return amount
    } catch (error) {
      return undefined
    }
  }
}

export default ConnectionInstance
