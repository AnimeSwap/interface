import aptosLogo from 'assets/aptos_logo.svg'
import suiLogo from 'assets/sui_logo.svg'
import { Coin } from 'hooks/common/Coin'

import { SupportedChainId } from './chains'
import {
  APTOS_CoinInfo,
  APTOS_DEVNET_CoinInfo,
  APTOS_TESTNET_CoinInfo,
  SUI_CoinInfo,
  SUI_DEVNET_CoinInfo,
  SUI_TESTNET_CoinInfo,
} from './coinInfo'

interface BaseChainInfo {
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly logoUrl: string
  readonly label: string
  readonly helpCenterUrl?: string
  readonly nativeCoin: Coin
  readonly aniCoin?: Coin
  readonly defaultBuyCoin?: Coin
  readonly stableCoin: Coin
  readonly zUSDC?: Coin
  readonly color?: string
  readonly backgroundColor?: string
}

export type ChainInfoMap = { readonly [chainId: number]: BaseChainInfo }

export const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.APTOS]: {
    docs: 'https://aptoslabs.com/',
    explorer: 'https://explorer.aptoslabs.com/?network=mainnet',
    label: 'Aptos',
    logoUrl: aptosLogo,
    nativeCoin: APTOS_CoinInfo['0x1::aptos_coin::AptosCoin'],
    aniCoin: APTOS_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    defaultBuyCoin:
      APTOS_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    stableCoin: APTOS_CoinInfo['0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'],
    zUSDC: APTOS_CoinInfo['0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'],
  },
  [SupportedChainId.APTOS_TESTNET]: {
    bridge: 'https://dev-cbridge-v2.netlify.app/5/12360002/USDC',
    docs: 'https://aptoslabs.com/',
    explorer: 'https://explorer.aptoslabs.com/?network=testnet',
    label: 'AptosTest',
    logoUrl: aptosLogo,
    nativeCoin: APTOS_TESTNET_CoinInfo['0x1::aptos_coin::AptosCoin'],
    aniCoin:
      APTOS_TESTNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    defaultBuyCoin:
      APTOS_TESTNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    stableCoin:
      APTOS_TESTNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT'],
  },
  [SupportedChainId.APTOS_DEVNET]: {
    docs: 'https://aptoslabs.com/',
    explorer: 'https://explorer.aptoslabs.com/?network=devnet',
    label: 'AptosDev',
    logoUrl: aptosLogo,
    nativeCoin: APTOS_DEVNET_CoinInfo['0x1::aptos_coin::AptosCoin'],
    aniCoin:
      APTOS_DEVNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    defaultBuyCoin:
      APTOS_DEVNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    stableCoin:
      APTOS_DEVNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT'],
  },
  [SupportedChainId.SUI]: {
    docs: 'https://sui.io/',
    explorer: 'https://explorer.sui.io/?network=mainnet',
    label: 'Sui',
    logoUrl: suiLogo,
    nativeCoin: SUI_CoinInfo['0x2::sui::SUI'],
    aniCoin: SUI_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    defaultBuyCoin: SUI_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    stableCoin: SUI_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT'],
  },
  [SupportedChainId.SUI_TESTNET]: {
    docs: 'https://sui.io/',
    explorer: 'https://explorer.sui.io/?network=testnet',
    label: 'SuiTest',
    logoUrl: suiLogo,
    nativeCoin: SUI_TESTNET_CoinInfo['0x2::sui::SUI'],
    aniCoin: SUI_TESTNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    defaultBuyCoin:
      SUI_TESTNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    stableCoin:
      SUI_TESTNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT'],
  },
  [SupportedChainId.SUI_DEVNET]: {
    docs: 'https://sui.io/',
    explorer: 'https://explorer.sui.io/?network=devnet',
    label: 'SuiDev',
    logoUrl: suiLogo,
    nativeCoin: SUI_DEVNET_CoinInfo['0x2::sui::SUI'],
    aniCoin: SUI_DEVNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    defaultBuyCoin:
      SUI_DEVNET_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    stableCoin: SUI_DEVNET_CoinInfo['0xe78079ed76ee7b0c1726b33f7630e4fcd1475e8e::testcoin1::TESTCOIN1'],
  },
}

export function getChainInfo(chainId: SupportedChainId): BaseChainInfo {
  if (chainId) {
    return CHAIN_INFO[chainId] ?? undefined
  }
  return undefined
}

export function getChainInfoOrDefault(chainId: number | undefined) {
  return getChainInfo(chainId) ?? CHAIN_INFO[SupportedChainId.APTOS]
}
