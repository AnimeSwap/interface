import { Decimal, Route, Utils } from '@animeswap.org/v1-sdk'
import { BP } from 'constants/misc'
import { useEffect, useMemo, useState } from 'react'
import ConnectionInstance from 'state/connection/instance'

import { Coin } from './common/Coin'

export enum TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING,
}

export enum TradeType {
  EXACT_INPUT = 0,
  EXACT_OUTPUT = 1,
}

export class BestTrade {
  findTrade: Route.Trade
  tradeType: TradeType
  inputCoin: Coin
  outputCoin: Coin
  route: string[]
  inputAmount: Decimal
  outputAmount: Decimal
  maximumAmountIn: Decimal
  miniumAmountOut: Decimal
  price: Decimal
}

export function useBestTrade(
  tradeType: TradeType,
  amount: Decimal,
  inputCoin: Coin,
  outputCoin: Coin,
  toAddress: string,
  allowedSlippage: number,
  deadline: number
): {
  bestTrade: BestTrade
  tradeState: TradeState
} {
  const [bestTrade, setBestTrade] = useState<BestTrade>(null)
  const [tradeState, setTradeState] = useState<TradeState>(TradeState.LOADING)

  useEffect(() => {
    const fetchRoute = async () => {
      if (!amount || !inputCoin || !outputCoin) return
      setTradeState(TradeState.LOADING)
      const tradeList =
        tradeType === TradeType.EXACT_INPUT
          ? await ConnectionInstance.getSDK().route.getRouteSwapExactCoinForCoin({
              fromCoin: inputCoin.address,
              toCoin: outputCoin.address,
              amount,
            })
          : await ConnectionInstance.getSDK().route.getRouteSwapCoinForExactCoin({
              fromCoin: inputCoin.address,
              toCoin: outputCoin.address,
              amount,
            })
      if (tradeList.length === 0) {
        setTradeState(TradeState.NO_ROUTE_FOUND)
        return
      }
      setTradeState(TradeState.VALID)
      const findTrade = tradeList[0]
      const bestTrade = new BestTrade()
      bestTrade.findTrade = findTrade
      bestTrade.tradeType = tradeType
      bestTrade.inputCoin = inputCoin
      bestTrade.outputCoin = outputCoin
      bestTrade.route = findTrade.coinTypeList
      bestTrade.inputAmount = findTrade.amountList[0]
      bestTrade.outputAmount = findTrade.amountList[findTrade.amountList.length - 1]
      const payload =
        tradeType === TradeType.EXACT_INPUT
          ? ConnectionInstance.getSDK().route.swapExactCoinForCoinPayload({
              trade: findTrade,
              toAddress,
              slippage: BP.mul(allowedSlippage),
              deadline,
            })
          : ConnectionInstance.getSDK().route.swapCoinForExactCoinPayload({
              trade: findTrade,
              toAddress,
              slippage: BP.mul(allowedSlippage),
              deadline,
            })
      bestTrade.maximumAmountIn =
        tradeType === TradeType.EXACT_INPUT ? bestTrade.inputAmount : Utils.d(payload.arguments[1])
      bestTrade.miniumAmountOut =
        tradeType === TradeType.EXACT_OUTPUT ? bestTrade.outputAmount : Utils.d(payload.arguments[1])
      bestTrade.price = bestTrade.outputAmount
        .div(outputCoin.decimals)
        .div(bestTrade.inputAmount.div(inputCoin.decimals))
      setBestTrade(bestTrade)
    }
    // execution
    fetchRoute()
  }, [tradeType, amount, inputCoin, outputCoin])

  return useMemo(() => {
    return {
      bestTrade,
      tradeState,
    }
  }, [bestTrade, tradeState])
}
