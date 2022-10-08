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
export function getExplorerLink(chainId: number, data: string, type: ExplorerDataType): string {
  if (chainId === SupportedChainId.APTOS_DEVNET || chainId === SupportedChainId.APTOS) {
    switch (type) {
      case ExplorerDataType.TRANSACTION:
        return `https://explorer.aptoslabs.com/txn/${data}?network=Devnet`
      case ExplorerDataType.ADDRESS:
      case ExplorerDataType.TOKEN:
        return `https://explorer.aptoslabs.com/account/${data}?network=Devnet`
      case ExplorerDataType.BLOCK:
        return `https://explorer.aptoslabs.com/txn/${data}?network=Devnet`
      default:
        return `https://explorer.aptoslabs.com/?network=Devnet`
    }
  }
}
