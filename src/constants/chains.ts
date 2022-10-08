export enum SupportedChainId {
  APTOS = 1,
  APTOS_TESTNET = 2,
  APTOS_DEVNET = 33,
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.APTOS]: 'aptos',
  [SupportedChainId.APTOS_TESTNET]: 'aptos_testnet',
  [SupportedChainId.APTOS_DEVNET]: 'aptos_devnet',
}

export function isSupportedChain(chainId: number | undefined): chainId is SupportedChainId {
  return !!chainId && !!SupportedChainId[chainId]
}
