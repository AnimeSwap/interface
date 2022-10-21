import { SupportedChainId } from './chains'
import { APTOS_CoinInfo } from './coinInfo'

export const COIN_BASES = {
  [SupportedChainId.APTOS]: [
    APTOS_CoinInfo['0x1::aptos_coin::AptosCoin'],
    APTOS_CoinInfo['0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdcCoin'],
    APTOS_CoinInfo['0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdtCoin'],
    APTOS_CoinInfo['0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'],
    APTOS_CoinInfo['0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T'],
    APTOS_CoinInfo['0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT'],
  ],
  [SupportedChainId.APTOS_TESTNET]: [],
  [SupportedChainId.APTOS_DEVNET]: [],
}
