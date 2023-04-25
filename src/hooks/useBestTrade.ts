import { Decimal, Route, Utils } from '@animeswap.org/v1-sdk'
import { isAptosChain, isSuiChain, SupportedChainId } from 'constants/chains'
import { BP } from 'constants/misc'
import { useEffect, useMemo, useState } from 'react'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { useAccount } from 'state/wallets/hooks'

import { Coin, CoinAmount } from './common/Coin'

export enum TradeState {
  LOADING,
  INVALID,
  VALID,
  SYNCING,
}

export enum TradeType {
  EXACT_INPUT = 0,
  EXACT_OUTPUT = 1,
}

export class BestTrade {
  sdkTrade: Route.Trade
  tradeType: TradeType
  inputCoin: Coin
  outputCoin: Coin
  route: string[]
  inputAmount: CoinAmount<Coin>
  outputAmount: CoinAmount<Coin>
  maximumAmountIn: CoinAmount<Coin>
  miniumAmountOut: CoinAmount<Coin>
  price: Decimal
  priceImpact: Decimal
}

const cacheGetAllRoutes: {
  allRoute: any
  fromCoin: any
  toCoin: any
  bestTrade0: Route.Trade
  bestTrade1: Route.Trade
  chainId: SupportedChainId
} = {
  allRoute: undefined,
  fromCoin: undefined,
  toCoin: undefined,
  bestTrade0: undefined,
  bestTrade1: undefined,
  chainId: undefined,
}

export function useBestTrade(
  tradeType: TradeType,
  amount: Decimal,
  inputCoin: Coin,
  outputCoin: Coin,
  allowedSlippage: number
): {
  bestTrade: BestTrade
  tradeState: TradeState
} {
  const chainId = useChainId()
  const account = useAccount()
  const [bestTrade, setBestTrade] = useState<BestTrade>(null)
  const [tradeState, setTradeState] = useState<TradeState>(TradeState.LOADING)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((count) => count + 1)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchRoute = async () => {
      if (!amount || !inputCoin || !outputCoin || amount.eq(0)) return
      setTradeState(TradeState.LOADING)
      const fromCoin = inputCoin.address
      const toCoin = outputCoin.address
      // route v1
      // const tradeList =
      //   tradeType === TradeType.EXACT_INPUT
      //     ? await ConnectionInstance.getSDK().route.getRouteSwapExactCoinForCoin({
      //         fromCoin,
      //         toCoin,
      //         amount,
      //       })
      //     : await ConnectionInstance.getSDK().route.getRouteSwapCoinForExactCoin({
      //         fromCoin,
      //         toCoin,
      //         amount,
      //       })
      if (
        cacheGetAllRoutes.fromCoin !== fromCoin ||
        cacheGetAllRoutes.toCoin !== toCoin ||
        !cacheGetAllRoutes.allRoute ||
        cacheGetAllRoutes.chainId !== chainId
      ) {
        cacheGetAllRoutes.fromCoin = fromCoin
        cacheGetAllRoutes.toCoin = toCoin
        cacheGetAllRoutes.chainId = chainId
        cacheGetAllRoutes.allRoute = await ConnectionInstance.getSDK().routeV2.getAllRoutes(fromCoin, toCoin)
      }
      const candidateRouteList = ConnectionInstance.getSDK().routeV2.getCandidateRoutes(
        cacheGetAllRoutes.allRoute,
        cacheGetAllRoutes.bestTrade0 ?? undefined,
        cacheGetAllRoutes.bestTrade1 ?? undefined
      )
      const allCandidateRouteResources = await ConnectionInstance.getSDK().routeV2.getAllCandidateRouteResources(
        candidateRouteList
      )
      const tradeList =
        tradeType === TradeType.EXACT_INPUT
          ? ConnectionInstance.getSDK().routeV2.bestTradeExactIn(
              candidateRouteList,
              allCandidateRouteResources,
              fromCoin,
              amount
            )
          : ConnectionInstance.getSDK().routeV2.bestTradeExactOut(
              candidateRouteList,
              allCandidateRouteResources,
              fromCoin,
              toCoin,
              amount
            )
      if (tradeList.length === 0) {
        setTradeState(TradeState.INVALID)
        return
      }
      cacheGetAllRoutes.bestTrade0 = tradeList[0]
      if (tradeList.length > 1) {
        cacheGetAllRoutes.bestTrade1 = tradeList[1]
      }
      setTradeState(TradeState.VALID)
      const sdkTrade = tradeList[0]
      const bestTrade = new BestTrade()
      bestTrade.sdkTrade = sdkTrade
      bestTrade.tradeType = tradeType
      bestTrade.inputCoin = inputCoin
      bestTrade.outputCoin = outputCoin
      bestTrade.route = sdkTrade.coinTypeList
      bestTrade.inputAmount = new CoinAmount(inputCoin, sdkTrade.amountList[0])
      bestTrade.outputAmount = new CoinAmount(outputCoin, sdkTrade.amountList[sdkTrade.amountList.length - 1])
      const payload =
        tradeType === TradeType.EXACT_INPUT
          ? ConnectionInstance.getSDK().route.swapExactCoinForCoinPayload({
              trade: sdkTrade,
              slippage: BP.mul(allowedSlippage),
            })
          : ConnectionInstance.getSDK().route.swapCoinForExactCoinPayload({
              trade: sdkTrade,
              slippage: BP.mul(allowedSlippage),
            })
      bestTrade.maximumAmountIn =
        tradeType === TradeType.EXACT_INPUT
          ? bestTrade.inputAmount
          : new CoinAmount(inputCoin, Utils.d(payload.arguments[1]))

      bestTrade.miniumAmountOut =
        tradeType === TradeType.EXACT_OUTPUT
          ? bestTrade.outputAmount
          : new CoinAmount(outputCoin, Utils.d(payload.arguments[1]))
      bestTrade.price = bestTrade.inputAmount.amount
        .div(Utils.pow10(inputCoin?.decimals))
        .div(bestTrade.outputAmount.amount.div(Utils.pow10(outputCoin?.decimals)))
      bestTrade.priceImpact = sdkTrade.priceImpact
      setBestTrade(bestTrade)
    }
    const suiFetchRoute = async () => {
      if (!amount || !inputCoin || !outputCoin || amount.eq(0)) return
      setTradeState(TradeState.LOADING)
      const fromCoin = inputCoin.address
      const toCoin = outputCoin.address
      if (
        cacheGetAllRoutes.fromCoin !== fromCoin ||
        cacheGetAllRoutes.toCoin !== toCoin ||
        !cacheGetAllRoutes.allRoute ||
        cacheGetAllRoutes.chainId !== chainId
      ) {
        cacheGetAllRoutes.fromCoin = fromCoin
        cacheGetAllRoutes.toCoin = toCoin
        cacheGetAllRoutes.chainId = chainId
        cacheGetAllRoutes.allRoute = await ConnectionInstance.getSuiSDK().route.getAllRoutes(fromCoin, toCoin)
      }
      const candidateRouteList = ConnectionInstance.getSuiSDK().route.getCandidateRoutes(
        cacheGetAllRoutes.allRoute,
        cacheGetAllRoutes.bestTrade0 ?? undefined,
        cacheGetAllRoutes.bestTrade1 ?? undefined
      )
      // console.log('candidateRouteList', fromCoin, toCoin, cacheGetAllRoutes.allRoute)
      const allCandidateRouteResources = await ConnectionInstance.getSuiSDK().route.getAllCandidateRouteResources(
        candidateRouteList
      )
      const tradeList =
        tradeType === TradeType.EXACT_INPUT
          ? ConnectionInstance.getSuiSDK().route.bestTradeExactIn(
              candidateRouteList,
              allCandidateRouteResources,
              fromCoin,
              amount
            )
          : ConnectionInstance.getSuiSDK().route.bestTradeExactOut(
              candidateRouteList,
              allCandidateRouteResources,
              fromCoin,
              toCoin,
              amount
            )
      // console.log('tradeList', tradeType, candidateRouteList, tradeList)
      if (tradeList.length === 0) {
        setTradeState(TradeState.INVALID)
        return
      }
      cacheGetAllRoutes.bestTrade0 = tradeList[0]
      if (tradeList.length > 1) {
        cacheGetAllRoutes.bestTrade1 = tradeList[1]
      }
      const sdkTrade = tradeList[0]
      const bestTrade = new BestTrade()
      bestTrade.sdkTrade = sdkTrade
      bestTrade.tradeType = tradeType
      bestTrade.inputCoin = inputCoin
      bestTrade.outputCoin = outputCoin
      bestTrade.route = sdkTrade.coinTypeList
      bestTrade.inputAmount = new CoinAmount(inputCoin, sdkTrade.amountList[0])
      bestTrade.outputAmount = new CoinAmount(outputCoin, sdkTrade.amountList[sdkTrade.amountList.length - 1])
      const [payload, rawPayload] =
        tradeType === TradeType.EXACT_INPUT
          ? await ConnectionInstance.getSuiSDK().route.swapExactCoinForCoinPayload({
              address: account,
              trade: sdkTrade,
              slippage: BP.mul(allowedSlippage),
            })
          : await ConnectionInstance.getSuiSDK().route.swapCoinForExactCoinPayload({
              address: account,
              trade: sdkTrade,
              slippage: BP.mul(allowedSlippage),
            })
      setTradeState(TradeState.VALID)
      bestTrade.maximumAmountIn =
        tradeType === TradeType.EXACT_INPUT
          ? bestTrade.inputAmount
          : new CoinAmount(inputCoin, Utils.d(rawPayload.arguments[4].toString()))

      bestTrade.miniumAmountOut =
        tradeType === TradeType.EXACT_OUTPUT
          ? bestTrade.outputAmount
          : new CoinAmount(outputCoin, Utils.d(rawPayload.arguments[4].toString()))
      bestTrade.price = bestTrade.inputAmount.amount
        .div(Utils.pow10(inputCoin?.decimals))
        .div(bestTrade.outputAmount.amount.div(Utils.pow10(outputCoin?.decimals)))
      bestTrade.priceImpact = sdkTrade.priceImpact
      setBestTrade(bestTrade)
    }

    // execution
    if (isAptosChain(chainId)) {
      fetchRoute()
    } else if (isSuiChain(chainId)) {
      suiFetchRoute()
    }
  }, [tradeType, amount, inputCoin, outputCoin, allowedSlippage, count])

  return useMemo(() => {
    return {
      bestTrade,
      tradeState,
    }
  }, [bestTrade, tradeState])
}
