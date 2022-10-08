import { AptosClient } from 'aptos'
import { Console } from 'console'
import { SupportedChainId } from 'constants/chains'
import store from 'state'
import { setCoinBalances } from 'state/wallets/reducer'

import { ConnectionType, getRPCURL } from './reducer'

class ConnectionInstance {
  private static aptosClient: AptosClient

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

  public static async getAccountResource(account: string, type: string) {
    try {
      const aptosClient = ConnectionInstance.getAptosClient()
      const res = await aptosClient.getAccountResource(account, type)
      const data: any = res.data
      return data
    } catch (error) {
      console.log(`getAccountResource error ${account} ${type}`, error)
      return undefined
    }
  }

  public static async getAccountResources(account: string) {
    try {
      const aptosClient = ConnectionInstance.getAptosClient()
      const res = await aptosClient.getAccountResources(account)
      return res
    } catch (error) {
      console.log(`getAccountResources error ${account}`, error)
      return undefined
    }
  }

  public static async getCoinBalance(account: string, type: string) {
    try {
      console.log(`getCoinBalance ${account} ${type}`)
      const res = await ConnectionInstance.getAccountResource(account, `0x1::coin::CoinStore<${type}>`)
      console.log(`getCoinBalance return`, res)
      const amount = res.coin.value
      store.dispatch(setCoinBalances({ coinBalances: { [type]: amount } }))
      return amount
    } catch (error) {
      console.log(`getCoinBalance error ${account} ${type}`, error)
      return undefined
    }
  }
}

export default ConnectionInstance
