import { SupportedChainId } from './chains'
import { APTOS_CoinInfo } from './coinInfo'

export const COIN_BASES = {
  [SupportedChainId.APTOS]: [
    APTOS_CoinInfo['0x1::aptos_coin::AptosCoin'],
    APTOS_CoinInfo['0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T'],
  ],
  [SupportedChainId.APTOS_TESTNET]: [],
  [SupportedChainId.APTOS_DEVNET]: [],
}
