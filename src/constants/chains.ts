import { NetworkType } from '@animeswap.org/v1-sdk'

export enum SupportedChainId {
  APTOS = 1,
  APTOS_TESTNET = 2,
  APTOS_DEVNET = 34,
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.APTOS]: 'aptos',
  [SupportedChainId.APTOS_TESTNET]: 'aptos_testnet',
  [SupportedChainId.APTOS_DEVNET]: 'aptos_devnet',
}

export const CHAIN_IDS_TO_SDK_NETWORK = {
  [SupportedChainId.APTOS]: NetworkType.Mainnet,
  [SupportedChainId.APTOS_TESTNET]: NetworkType.Testnet,
  [SupportedChainId.APTOS_DEVNET]: NetworkType.Devnet,
}

export function isSupportedChain(chainId: number | undefined): chainId is SupportedChainId {
  return !!chainId && !!SupportedChainId[chainId]
}
