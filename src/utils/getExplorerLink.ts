import { SupportedChainId } from '../constants/chains'

export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 */
export function getExplorerLink(chainId: SupportedChainId, data: string, type: ExplorerDataType): string {
  switch (type) {
    case ExplorerDataType.TRANSACTION:
      return `https://explorer.aptoslabs.com/txn/${data}?network=${getNextworkTag(chainId)}`
    case ExplorerDataType.ADDRESS:
    case ExplorerDataType.TOKEN:
      return `https://explorer.aptoslabs.com/account/${data}?network=${getNextworkTag(chainId)}`
    case ExplorerDataType.BLOCK:
      return `https://explorer.aptoslabs.com/txn/${data}?network=${getNextworkTag(chainId)}`
    default:
      return `https://explorer.aptoslabs.com/?network=${getNextworkTag(chainId)}`
  }
}

function getNextworkTag(chainId: SupportedChainId) {
  switch (chainId) {
    case SupportedChainId.APTOS:
      return 'testnet'
    case SupportedChainId.APTOS_TESTNET:
      return 'testnet'
    case SupportedChainId.APTOS_DEVNET:
      return 'devnet'
  }
}
