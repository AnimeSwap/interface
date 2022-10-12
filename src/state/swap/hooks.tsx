import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { BestTrade, TradeType, useBestTrade } from 'hooks/useBestTrade'
import { TradeState } from 'hooks/useBestTrade'
import { ParsedQs } from 'qs'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useChainId, useUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks'
import { useAccount, useCoinBalance } from 'state/wallets/hooks'
import { tryParseCoinAmount } from 'utils/tryParseCoinAmount'

import { Coin, useCoin } from '../../hooks/common/Coin'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress, isCoinAddress } from '../../utils'
import { AppState } from '../index'
import { Field, replaceSwapState, selectCoin, switchCoins, typeInput } from './actions'
import { SwapState } from './reducer'

export function useSwapState(): AppState['swap'] {
  return useAppSelector((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCoinSelection: (field: Field, currency: Coin) => void
  onSwitchCoins: () => void
  onUserInput: (field: Field, typedValue: string) => void
} {
  const dispatch = useAppDispatch()
  const onCoinSelection = useCallback(
    (field: Field, currency: Coin) => {
      dispatch(
        selectCoin({
          field,
          coinId: currency.address,
        })
      )
    },
    [dispatch]
  )

  const onSwitchCoins = useCallback(() => {
    dispatch(switchCoins())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  return {
    onSwitchCoins,
    onCoinSelection,
    onUserInput,
  }
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  inputCoin: Coin | null
  outputCoin: Coin | null
  inputCoinBalance: Decimal
  outputCoinBalance: Decimal
  isExactIn: boolean
  parsedAmount: Decimal
  inputError?: ReactNode
  trade: {
    bestTrade: BestTrade
    tradeState: TradeState
  }
  allowedSlippage: number
  deadline: number
  toAddress: string
} {
  const account = useAccount()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { coinId: inputCoinId },
    [Field.OUTPUT]: { coinId: outputCoinId },
  } = useSwapState()
  const inputCoin = useCoin(inputCoinId)
  const outputCoin = useCoin(outputCoinId)
  const inputCoinBalance = Utils.d(useCoinBalance(inputCoin?.address))
  const outputCoinBalance = Utils.d(useCoinBalance(outputCoin?.address))
  const allowedSlippage = useUserSlippageTolerance()
  const deadline = useUserTransactionTTL()[0]

  const toAddress: string | null = account ?? null

  const isExactIn: boolean = independentField === Field.INPUT

  const parsedAmount = useMemo(
    () => tryParseCoinAmount(typedValue, (isExactIn ? inputCoin : outputCoin) ?? undefined),
    [inputCoin, isExactIn, outputCoin, typedValue]
  )

  const trade = useBestTrade(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    inputCoin,
    outputCoin,
    toAddress,
    allowedSlippage,
    deadline
  )

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!inputCoin || !outputCoin) {
      inputError = inputError ?? <Trans>Select a coin</Trans>
    }

    if (!parsedAmount || parsedAmount.lte(0)) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    if (!toAddress) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    }
    // compare input balance to max input based on version
    const [balanceIn, amountIn] = [inputCoinBalance, trade.bestTrade?.maximumAmountIn]
    if (balanceIn && amountIn && balanceIn.lt(amountIn.amount)) {
      inputError = <Trans>Insufficient {inputCoin?.symbol} balance</Trans>
    }

    return inputError
  }, [account, allowedSlippage, inputCoin, outputCoin, inputCoinBalance, parsedAmount, toAddress, trade])

  return useMemo(
    () => ({
      inputCoin,
      outputCoin,
      inputCoinBalance,
      outputCoinBalance,
      isExactIn,
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
      deadline,
      toAddress,
    }),
    [
      inputCoin,
      outputCoin,
      inputCoinBalance,
      outputCoinBalance,
      isExactIn,
      inputError,
      parsedAmount,
      trade,
      allowedSlippage,
      deadline,
      toAddress,
    ]
  )
}

function parseCoinFromURLParameter(urlParam: ParsedQs[string]): string {
  if (typeof urlParam === 'string') {
    const valid = isCoinAddress(urlParam)
    if (valid) return valid
  }
  return ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCoin = parseCoinFromURLParameter(parsedQs.inputCoin)
  let outputCoin = parseCoinFromURLParameter(parsedQs.outputCoin)
  const typedValue = parseTokenAmountURLParameter(parsedQs.exactAmount)
  const independentField = parseIndependentFieldURLParameter(parsedQs.exactField)
  if (inputCoin === '' && outputCoin === '' && typedValue === '' && independentField === Field.INPUT) {
    // Defaults to having the native coin selected
    inputCoin = getChainInfoOrDefault(undefined).nativeCoin.address
  } else if (inputCoin === outputCoin) {
    // clear output if identical
    outputCoin = ''
  }
  return {
    [Field.INPUT]: {
      coinId: inputCoin === '' ? null : inputCoin ?? null,
    },
    [Field.OUTPUT]: {
      coinId: outputCoin === '' ? null : outputCoin ?? null,
    },
    typedValue,
    independentField,
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch(): SwapState {
  const chainId = useChainId()
  const dispatch = useAppDispatch()
  const parsedQs = useParsedQueryString()

  const parsedSwapState = useMemo(() => {
    return queryParametersToSwapState(parsedQs)
  }, [parsedQs])

  useEffect(() => {
    if (!chainId) return
    const inputCoinId = parsedSwapState[Field.INPUT].coinId ?? undefined
    const outputCoinId = parsedSwapState[Field.OUTPUT].coinId ?? undefined

    dispatch(
      replaceSwapState({
        typedValue: parsedSwapState.typedValue,
        field: parsedSwapState.independentField,
        inputCoinId,
        outputCoinId,
      })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return parsedSwapState
}
