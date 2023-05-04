import { SupportedChainId } from './chains'
import { APTOS_CoinInfo, SUI_CoinInfo } from './coinInfo'

export const COIN_BASES = {
  [SupportedChainId.APTOS]: [
    APTOS_CoinInfo['0x1::aptos_coin::AptosCoin'],
    APTOS_CoinInfo['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI'],
    APTOS_CoinInfo['0x777821c78442e17d82c3d7a371f42de7189e4248e529fe6eee6bca40ddbb::apcoin::ApCoin'],
    APTOS_CoinInfo['0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'],
    APTOS_CoinInfo['0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T'],
    APTOS_CoinInfo['0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT'],
  ],
  [SupportedChainId.APTOS_TESTNET]: [],
  [SupportedChainId.APTOS_DEVNET]: [],
  [SupportedChainId.SUI]: [
    SUI_CoinInfo['0x2::sui::SUI'],
    SUI_CoinInfo['0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN'],
    SUI_CoinInfo['0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN'],
    SUI_CoinInfo['0xb231fcda8bbddb31f2ef02e6161444aec64a514e2c89279584ac9806ce9cf037::coin::COIN'],
    SUI_CoinInfo['0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN'],
    SUI_CoinInfo['0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN'],
  ],
}
