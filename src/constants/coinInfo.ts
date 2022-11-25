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
  '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI': {
    address: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI',
    decimals: 8,
    symbol: 'ANI',
    name: 'AnimeSwap Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/ANI.png'],
    projectURL: 'http://animeswap.org/',
  },
  '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC': {
    address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
    decimals: 6,
    symbol: 'zUSDC',
    name: 'LayerZero USD Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/USDC.webp'],
  },
  '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T': {
    address: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T',
    decimals: 6,
    symbol: 'whUSDC',
    name: 'Wormhole USD Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/USDC.webp'],
  },
  '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH': {
    address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH',
    decimals: 6,
    symbol: 'zWETH',
    name: 'LayerZero Wrapped Ethereum',
    logoURL: ['https://coinlist.animeswap.org/icons/WETH.png'],
  },
  '0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin': {
    address: '0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin',
    decimals: 8,
    symbol: 'tAPT',
    name: 'Tortuga Staked APT',
    logoURL: ['https://coinlist.animeswap.org/icons/tAPT.svg'],
    projectURL: 'https://tortuga.finance/',
  },
  '0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5::staked_coin::StakedAptos': {
    address: '0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5::staked_coin::StakedAptos',
    decimals: 8,
    symbol: 'stAPT',
    name: 'Ditto Staked Aptos',
    logoURL: ['https://coinlist.animeswap.org/icons/DittoStakedAptos.svg'],
    projectURL: 'https://www.dittofinance.io/',
  },
  '0x777821c78442e17d82c3d7a371f42de7189e4248e529fe6eee6bca40ddbb::apcoin::ApCoin': {
    address: '0x777821c78442e17d82c3d7a371f42de7189e4248e529fe6eee6bca40ddbb::apcoin::ApCoin',
    decimals: 8,
    symbol: 'APC',
    name: 'Apass Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/APC.png'],
    projectURL: 'https://aptpp.com/',
  },
  '0x84edd115c901709ef28f3cb66a82264ba91bfd24789500b6fd34ab9e8888e272::coin::DLC': {
    address: '0x84edd115c901709ef28f3cb66a82264ba91bfd24789500b6fd34ab9e8888e272::coin::DLC',
    decimals: 8,
    symbol: 'DLC',
    name: 'Doglaika Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/DLC.png'],
    projectURL: 'https://doglaikacoin.xyz',
  },
  '0xe9c192ff55cffab3963c695cff6dbf9dad6aff2bb5ac19a6415cad26a81860d9::mee_coin::MeeCoin': {
    address: '0xe9c192ff55cffab3963c695cff6dbf9dad6aff2bb5ac19a6415cad26a81860d9::mee_coin::MeeCoin',
    decimals: 6,
    symbol: 'MEE',
    name: 'Meeiro',
    logoURL: ['https://coinlist.animeswap.org/icons/MEE.svg'],
    projectURL: 'https://meeiro.xyz',
  },
  '0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47cf::Aptoge::Aptoge': {
    address: '0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47cf::Aptoge::Aptoge',
    decimals: 6,
    symbol: 'APTOGE',
    name: 'Aptoge',
    logoURL: ['https://coinlist.animeswap.org/icons/APTOGE.svg'],
  },
  '0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::coin::MOJO': {
    address: '0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::coin::MOJO',
    decimals: 8,
    symbol: 'MOJO',
    name: 'Mojito',
    logoURL: ['https://coinlist.animeswap.org/icons/MOJO.svg'],
    projectURL: 'https://www.mojito.markets/',
  },
  '0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA': {
    address: '0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA',
    decimals: 6,
    symbol: 'USDA',
    name: 'Argo USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDA.svg'],
    projectURL: 'https://argo.fi/',
  },
  '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT': {
    address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
    decimals: 6,
    symbol: 'zUSDT',
    name: 'LayerZero Tether USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDT.webp'],
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
  '0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T': {
    address: '0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T',
    decimals: 6,
    symbol: 'whUSDT',
    name: 'Wormhole Tether USD',
    logoURL: ['https://coinlist.animeswap.org/icons/USDT.webp'],
  },
  '0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T': {
    address: '0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T',
    decimals: 8,
    symbol: 'whSOL',
    name: 'Wormhole Solana',
    logoURL: ['https://coinlist.animeswap.org/icons/SOL.svg'],
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
  '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI': {
    address: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI',
    decimals: 8,
    symbol: 'ANI',
    name: 'AnimeSwap Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/ANI.png'],
    projectURL: 'http://animeswap.org/',
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
  '0xc7aef22455c9e3744d98d6dc024d0ed898dc6d307def82abd563653ecbb1e022::koiz_coin::KoizCoin': {
    address: '0xc7aef22455c9e3744d98d6dc024d0ed898dc6d307def82abd563653ecbb1e022::koiz_coin::KoizCoin',
    decimals: 6,
    symbol: 'KOIZ',
    name: 'Koiz Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/KOIZ.png'],
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
  '0x5c341dec2396029a7713cb59decee89635a6f851a5fe528fc39761ec2ddbf99a::celer_coin_manager::UsdcCoin': {
    address: '0x5c341dec2396029a7713cb59decee89635a6f851a5fe528fc39761ec2ddbf99a::celer_coin_manager::UsdcCoin',
    decimals: 8,
    symbol: 'ceUSDC',
    name: 'Celer USD Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/USDC.webp'],
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
  '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI': {
    address: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI',
    decimals: 8,
    symbol: 'ANI',
    name: 'AnimeSwap Coin',
    logoURL: ['https://coinlist.animeswap.org/icons/ANI.png'],
    projectURL: 'http://animeswap.org/',
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
