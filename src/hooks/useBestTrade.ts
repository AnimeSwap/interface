import { Decimal } from '@animeswap.org/v1-sdk'
import { useEffect, useMemo, useState } from 'react'
import ConnectionInstance from 'state/connection/instance'
import { useAccount } from 'state/wallets/hooks'

export enum TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING,
}

import { Coin } from './common/Coin'

export enum TradeType {
  EXACT_INPUT = 0,
  EXACT_OUTPUT = 1,
}

export class Trade {
  tradeType: TradeType
  inputCoin: Coin
  outputCoin: Coin
  route: string | undefined
  inputAmount: Decimal
  outputAmount: Decimal
  maximumAmountIn: Decimal
  miniumAmountOut: Decimal
  price: Decimal
  transaction: any
}

function findPoolType(inputCoin: Coin, outputCoin: Coin): string {
  const APT = inputCoin.symbol === 'APT' || outputCoin.symbol === 'APT'
  const USDT = inputCoin.symbol === 'USDT' || outputCoin.symbol === 'USDT'
  const BTC = inputCoin.symbol === 'BTC' || outputCoin.symbol === 'BTC'
  const ceDAI = inputCoin.symbol === 'ceDAI' || outputCoin.symbol === 'ceDAI'
  const ceUSDC = inputCoin.symbol === 'ceUSDC' || outputCoin.symbol === 'ceUSDC'
  const ceUSDT = inputCoin.symbol === 'ceUSDT' || outputCoin.symbol === 'ceUSDT'
  const ceWBTC = inputCoin.symbol === 'ceWBTC' || outputCoin.symbol === 'ceWBTC'
  const ceWETH = inputCoin.symbol === 'ceWETH' || outputCoin.symbol === 'ceWETH'
  const tAPT = inputCoin.symbol === 'tAPT' || outputCoin.symbol === 'tAPT'
  if (APT && USDT) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x1::aptos_coin::AptosCoin, 0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT>>'
  }
  if (APT && BTC) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x1::aptos_coin::AptosCoin, 0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC>>'
  }
  if (BTC && USDT) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC, 0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC, 0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT>>'
  }
  if (APT && ceDAI) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_dai_coin::TestMintCoin, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_dai_coin::TestMintCoin>>'
  }
  if (APT && ceUSDC) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_usdc_coin::TestMintCoin, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_usdc_coin::TestMintCoin>>'
  }
  if (APT && ceUSDT) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_usdt_coin::TestMintCoin, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_usdt_coin::TestMintCoin>>'
  }
  if (APT && ceWBTC) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_wbtc_coin::TestMintCoin, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_wbtc_coin::TestMintCoin>>'
  }
  if (APT && ceWETH) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_weth_coin::TestMintCoin, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0xbc954a7df993344c9fec9aaccdf96673a897025119fc38a8e0f637598496b47a::test_mint_weth_coin::TestMintCoin>>'
  }
  if (APT && tAPT) {
    return '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::LiquidityPool<0x1::aptos_coin::AptosCoin, 0x12d75d5bde2535789041cd380e832038da873a4ba86348ca891d374e1d0e15ab::staked_aptos_coin::StakedAptosCoin, 0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0x12d75d5bde2535789041cd380e832038da873a4ba86348ca891d374e1d0e15ab::staked_aptos_coin::StakedAptosCoin>>'
  }
}
const poolAccount = '0xe73ee18380b91e37906a728540d2c8ac7848231a26b99ee5631351b3543d7cf2'

export function useAnimeSwapTempTrade(
  tradeType: TradeType,
  amount: Decimal,
  inputCoin: Coin,
  outputCoin: Coin
): {
  state: TradeState
  trade: Trade
} {
  const account = useAccount()
  const [reserve, setReserve] = useState<any>({})

  useEffect(() => {
    const getPrice = async () => {
      if (!amount || !inputCoin || !outputCoin) return
      const res = await ConnectionInstance.getAccountResource(poolAccount, findPoolType(inputCoin, outputCoin))
      if (!res) {
        setReserve({
          inputReserve: 1,
          outputReserve: 1,
          price: 1,
          inputSymbol: inputCoin.symbol,
          outputSymbol: outputCoin.symbol,
          state: TradeState.NO_ROUTE_FOUND,
        })
        return
      }
      const x_reserve = parseInt(res.coin_x_reserve.value)
      const y_reserve = parseInt(res.coin_y_reserve.value)
      if (inputCoin.symbol === 'APT' || (inputCoin.symbol === 'BTC' && outputCoin.symbol === 'USDT')) {
        setReserve({
          inputReserve: x_reserve,
          outputReserve: y_reserve,
          price: y_reserve / x_reserve,
          inputSymbol: inputCoin.symbol,
          outputSymbol: outputCoin.symbol,
        })
      } else {
        setReserve({
          inputReserve: y_reserve,
          outputReserve: x_reserve,
          price: x_reserve / y_reserve,
          inputSymbol: inputCoin.symbol,
          outputSymbol: outputCoin.symbol,
        })
      }
    }
    getPrice()
  }, [tradeType, amount, inputCoin, outputCoin])

  return useMemo(() => {
    let state =
      reserve?.inputSymbol === inputCoin?.symbol && reserve?.outputSymbol === outputCoin?.symbol
        ? TradeState.VALID
        : TradeState.LOADING
    if (reserve?.state === TradeState.NO_ROUTE_FOUND) {
      state = TradeState.NO_ROUTE_FOUND
    }
    // amout is value with no decimals
    const trade = new Trade()
    trade.tradeType = tradeType
    trade.inputCoin = inputCoin
    trade.outputCoin = outputCoin
    trade.route = `${inputCoin?.address},${outputCoin?.address}`
    if (!amount || !inputCoin || !outputCoin || state !== TradeState.VALID) {
      // do nothing
    } else if (tradeType === TradeType.EXACT_INPUT) {
      trade.inputAmount = amount
      trade.maximumAmountIn = amount
      trade.outputAmount = amount.mul(reserve.price).floor()
      trade.miniumAmountOut = trade.outputAmount.mul(0.98).floor()
      if (trade.outputAmount.lessThan(1)) {
        state = TradeState.INVALID
      }
      trade.price = trade.outputAmount
        .mul(new Decimal(10).pow(-trade.outputCoin.decimals))
        .div(trade.inputAmount.mul(new Decimal(10).pow(-trade.inputCoin.decimals)))
      trade.transaction = {
        type: 'entry_function_payload',
        function:
          '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::swap_exact_coins_for_coins_entry',
        type_arguments: [inputCoin.address, outputCoin.address],
        arguments: [trade.inputAmount.toString(), 1, account, 1691479027],
      }
    } else if (tradeType === TradeType.EXACT_OUTPUT) {
      trade.inputAmount = amount.div(reserve.price).ceil()
      trade.maximumAmountIn = amount.div(reserve.price).mul(1.02).ceil()
      trade.outputAmount = amount
      trade.miniumAmountOut = amount
      if (trade.inputAmount.lessThan(1)) {
        state = TradeState.INVALID
      }
      trade.price = trade.outputAmount
        .mul(new Decimal(10).pow(-trade.outputCoin.decimals))
        .div(trade.inputAmount.mul(new Decimal(10).pow(-trade.inputCoin.decimals)))
      trade.transaction = {
        type: 'entry_function_payload',
        function:
          '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::swap_coins_for_exact_coins_entry',
        type_arguments: [inputCoin.address, outputCoin.address],
        arguments: [trade.outputAmount.toString(), 9e11, account, 1691479027],
      }
    }
    return {
      state,
      trade,
    }
  }, [tradeType, amount, inputCoin, outputCoin, reserve])
}
