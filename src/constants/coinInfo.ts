import { Coin } from 'hooks/common/Coin'

export const APTOS_CoinInfo: { [address: string]: Coin } = {
  '0x1::aptos_coin::AptosCoin': {
    address: '0x1::aptos_coin::AptosCoin',
    decimals: 8,
    symbol: 'APT',
    name: 'Aptos',
    logoURL: ['https://coinlist.animeswap.org/icons/APT.svg'],
    projectURL: 'https://aptoslabs.com/',
  },
  '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T': {
    address: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T',
    decimals: 6,
    symbol: 'whUSDC',
    name: 'Wormhole USD Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/USDC.webp'],
  },
  '0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T': {
    address: '0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T',
    decimals: 6,
    symbol: 'whUSDT',
    name: 'Wormhole Tether USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDT.webp'],
  },
  '0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T': {
    address: '0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T',
    decimals: 8,
    symbol: 'whWBTC',
    name: 'Wormhole Wrapped BTC',
    logoURL: ['https://coinlist.animeswap.org/icons/BTC.webp'],
  },
  '0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T': {
    address: '0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T',
    decimals: 8,
    symbol: 'whWETH',
    name: 'Wormhole Wrapped Ether',
    logoURL: ['https://coinlist.animeswap.org/icons/WETH.png'],
  },
  '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdcCoin': {
    address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdcCoin',
    decimals: 6,
    symbol: 'ceUSDC',
    name: 'Celer USD Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/USDC.webp'],
  },
  '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdtCoin': {
    address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdtCoin',
    decimals: 6,
    symbol: 'ceUSDT',
    name: 'Celer Tether USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDT.webp'],
  },
  '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::DaiCoin': {
    address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::DaiCoin',
    decimals: 8,
    symbol: 'ceDAI',
    name: 'Celer Dai Stablecoin',
    logoURL: ['https://coinlist.animeswap.org/icons/DAI.webp'],
  },
  '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WethCoin': {
    address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WethCoin',
    decimals: 6,
    symbol: 'ceWETH',
    name: 'Celer Wrapped Ethereum',
    logoURL: ['https://coinlist.animeswap.org/icons/WETH.png'],
  },
  '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WbtcCoin': {
    address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WbtcCoin',
    decimals: 8,
    symbol: 'ceWBTC',
    name: 'Celer Wrapped BTC',
    logoURL: ['https://coinlist.animeswap.org/icons/BTC.webp'],
  },
  '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BnbCoin': {
    address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BnbCoin',
    decimals: 8,
    symbol: 'ceBNB',
    name: 'Celer Binance Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/BNB.png'],
  },
  '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BusdCoin': {
    address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BusdCoin',
    decimals: 8,
    symbol: 'ceBUSD',
    name: 'Celer Binance USD',
    logoURL: ['https://coinlist.animeswap.org/icons/BUSD.png'],
  },
  '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC': {
    address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
    decimals: 6,
    symbol: 'zUSDC',
    name: 'LayerZero USD Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/USDC.webp'],
  },
  '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT': {
    address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
    decimals: 6,
    symbol: 'zUSDT',
    name: 'LayerZero Tether USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDT.webp'],
  },
  '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH': {
    address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH',
    decimals: 6,
    symbol: 'zWETH',
    name: 'LayerZero Wrapped Ethereum',
    logoURL: ['https://coinlist.animeswap.org/icons/WETH.png'],
  },
}

export const APTOS_TESTNET_CoinInfo: { [address: string]: Coin } = {
  '0x1::aptos_coin::AptosCoin': {
    address: '0x1::aptos_coin::AptosCoin',
    decimals: 8,
    symbol: 'APT',
    name: 'Aptos',
    logoURL: ['https://coinlist.animeswap.org/icons/APT.svg'],
    projectURL: 'https://aptoslabs.com/',
  },
  '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT': {
    address: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT',
    decimals: 8,
    symbol: 'USDT',
    name: 'Tether USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDT.webp'],
  },
  '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC': {
    address: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC',
    decimals: 8,
    symbol: 'BTC',
    name: 'Bitcoin',
    logoURL: ['https://coinlist.animeswap.org/icons/BTC.webp'],
  },
  '0x2a2ad97dfdbe4e34cdc9321c63592dda455f18bc25c9bb1f28260312159eae27::staked_aptos_coin::StakedAptosCoin': {
    address: '0x2a2ad97dfdbe4e34cdc9321c63592dda455f18bc25c9bb1f28260312159eae27::staked_aptos_coin::StakedAptosCoin',
    decimals: 8,
    symbol: 'tAPT',
    name: 'Tortuga Staked APT',
    logoURL: ['https://coinlist.animeswap.org/icons/tAPT.svg'],
    projectURL: 'https://tortuga.finance/',
  },
  '0xe4497a32bf4a9fd5601b27661aa0b933a923191bf403bd08669ab2468d43b379::move_coin::MoveCoin': {
    address: '0xe4497a32bf4a9fd5601b27661aa0b933a923191bf403bd08669ab2468d43b379::move_coin::MoveCoin',
    decimals: 8,
    symbol: 'MOVE',
    name: 'BlueMove Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/MOVE.svg'],
    projectURL: 'https://bluemove.net/',
  },
  '0x4dd8a22e95f3ec2448ee1cc6634298024095ce8baa3031650b3852af6e2d41d0::celer_coin_manager::UsdcCoin': {
    address: '0x4dd8a22e95f3ec2448ee1cc6634298024095ce8baa3031650b3852af6e2d41d0::celer_coin_manager::UsdcCoin',
    decimals: 8,
    symbol: 'ceUSDC',
    name: 'Celer USD Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/USDC.webp'],
  },
  '0x4dd8a22e95f3ec2448ee1cc6634298024095ce8baa3031650b3852af6e2d41d0::celer_coin_manager::WethCoin': {
    address: '0x4dd8a22e95f3ec2448ee1cc6634298024095ce8baa3031650b3852af6e2d41d0::celer_coin_manager::WethCoin',
    decimals: 8,
    symbol: 'ceWETH',
    name: 'Celer Wrapped Ethereum',
    logoURL: ['https://coinlist.animeswap.org/icons/WETH.png'],
  },
}

export const APTOS_DEVNET_CoinInfo: { [address: string]: Coin } = {
  '0x1::aptos_coin::AptosCoin': {
    address: '0x1::aptos_coin::AptosCoin',
    decimals: 8,
    symbol: 'APT',
    name: 'Aptos',
    logoURL: ['https://coinlist.animeswap.org/icons/APT.svg'],
    projectURL: 'https://aptoslabs.com/',
  },
  '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT': {
    address: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT',
    decimals: 8,
    symbol: 'USDT',
    name: 'Tether USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDT.webp'],
  },
  '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC': {
    address: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC',
    decimals: 8,
    symbol: 'BTC',
    name: 'Bitcoin',
    logoURL: ['https://coinlist.animeswap.org/icons/BTC.webp'],
  },
  '0xfa8c09437aa00eef18849eb9bfabf2be0dac73f03da91f46218cd1647278931b::staked_aptos_coin::StakedAptosCoin': {
    address: '0xfa8c09437aa00eef18849eb9bfabf2be0dac73f03da91f46218cd1647278931b::staked_aptos_coin::StakedAptosCoin',
    decimals: 8,
    symbol: 'tAPT',
    name: 'Tortuga Staked APT',
    logoURL: ['https://coinlist.animeswap.org/icons/tAPT.svg'],
    projectURL: 'https://tortuga.finance/',
  },
  '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_dai_coin::TestMintCoin': {
    address: '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_dai_coin::TestMintCoin',
    decimals: 8,
    symbol: 'ceDAI',
    name: 'Celer Dai Stablecoin',
    logoURL: ['https://coinlist.animeswap.org/icons/DAI.webp'],
  },
  '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_usdc_coin::TestMintCoin': {
    address: '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_usdc_coin::TestMintCoin',
    decimals: 8,
    symbol: 'ceUSDC',
    name: 'Celer USD Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/USDC.webp'],
  },
  '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_usdt_coin::TestMintCoin': {
    address: '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_usdt_coin::TestMintCoin',
    decimals: 8,
    symbol: 'ceUSDT',
    name: 'Celer Tether USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDT.webp'],
  },
  '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_wbtc_coin::TestMintCoin': {
    address: '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_wbtc_coin::TestMintCoin',
    decimals: 8,
    symbol: 'ceWBTC',
    name: 'Celer Wrapped Bitcoin',
    logoURL: ['https://coinlist.animeswap.org/icons/BTC.webp'],
  },
  '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_weth_coin::TestMintCoin': {
    address: '0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_weth_coin::TestMintCoin',
    decimals: 8,
    symbol: 'ceWETH',
    name: 'Celer Wrapped Ethereum',
    logoURL: ['https://coinlist.animeswap.org/icons/WETH.png'],
  },
}
