import { SupportedChainId } from './chains'
import { APTOS_CoinInfo } from './coinInfo'

export const COIN_BASES = {
  [SupportedChainId.APTOS]: [
    APTOS_CoinInfo['0x1::aptos_coin::AptosCoin'],
    APTOS_CoinInfo['0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC'],
    APTOS_CoinInfo['0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T'],
    APTOS_CoinInfo['0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::coin::MOJO'],
    APTOS_CoinInfo['0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47cf::Aptoge::Aptoge'],
    APTOS_CoinInfo[
      '0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin'
    ],
  ],
  [SupportedChainId.APTOS_TESTNET]: [],
  [SupportedChainId.APTOS_DEVNET]: [],
}
