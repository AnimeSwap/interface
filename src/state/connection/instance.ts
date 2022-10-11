import SDK, { AptosCoinStoreResource, AptosResource, NetworkType } from '@animeswap.org/v1-sdk'
import { AptosClient } from 'aptos'
import { SupportedChainId } from 'constants/chains'
import store from 'state'
import { resetCoinBalances, setCoinBalances } from 'state/wallets/reducer'

import { ConnectionType, getRPCURL } from './reducer'

class ConnectionInstance {
  private static aptosClient: AptosClient
  private static sdk: SDK

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
      const networkType: NetworkType =
        state.user.chainId === SupportedChainId.APTOS_DEVNET ? NetworkType.Devnet : NetworkType.Testnet
      ConnectionInstance.sdk = new SDK(getRPCURL(state.connection.currentConnection, state.user.chainId), networkType)
    }
    return ConnectionInstance.sdk
  }

  public static renewSDK(connection: ConnectionType, chainId: SupportedChainId) {
    const networkType: NetworkType =
      chainId === SupportedChainId.APTOS_DEVNET ? NetworkType.Devnet : NetworkType.Testnet
    ConnectionInstance.sdk = new SDK(getRPCURL(connection, chainId), networkType)
  }

  public static async syncAccountResources(account: string) {
    try {
      const aptosClient = ConnectionInstance.getAptosClient()
      const res: AptosResource<any>[] = await aptosClient.getAccountResources(account)
      // coin balance filter
      const coinBalances = {}
      for (const resource of res) {
        const type = resource.type
        if (!type.startsWith('0x1::coin::CoinStore<')) continue
        const coinType = type.substring(21, type.length - 1)
        coinBalances[coinType] = resource.data.coin.value
      }
      store.dispatch(resetCoinBalances({ coinBalances }))
      return res
    } catch (error) {
      store.dispatch(resetCoinBalances({ coinBalances: {} }))
      return undefined
    }
  }

  public static async getAccountResource(account: string, type: string) {
    try {
      const aptosClient = ConnectionInstance.getAptosClient()
      const res: AptosResource<any> = await aptosClient.getAccountResource(account, type)
      const data = res.data
      return data
    } catch (error) {
      return undefined
    }
  }

  public static async getCoinBalance(account: string, type: string) {
    try {
      console.log(`getCoinBalance ${account} ${type}`)
      const res: AptosCoinStoreResource = await ConnectionInstance.getAccountResource(
        account,
        `0x1::coin::CoinStore<${type}>`
      )
      console.log(`getCoinBalance return`, res)
      const amount = res.coin.value
      store.dispatch(setCoinBalances({ coinBalances: { [type]: amount } }))
      return amount
    } catch (error) {
      return undefined
    }
  }
}

export default ConnectionInstance
