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
  '0x12d75d5bde2535789041cd380e832038da873a4ba86348ca891d374e1d0e15ab::staked_aptos_coin::StakedAptosCoin': {
    address: '0x12d75d5bde2535789041cd380e832038da873a4ba86348ca891d374e1d0e15ab::staked_aptos_coin::StakedAptosCoin',
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
