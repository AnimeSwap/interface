import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { getChainInfo, getChainInfoOrDefault } from 'constants/chainInfo'
import { Trade, TradeType, useAnimeSwapTempTrade } from 'hooks/useBestTrade'
import { TradeState } from 'hooks/useBestTrade'
import { ParsedQs } from 'qs'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useChainId, useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { useAccount, useAllCoinBalance, useCoinBalance } from 'state/wallets/hooks'
import { tryParseCoinAmount } from 'utils/tryParseCoinAmount'

import { Coin, useCoin } from '../../hooks/common/Coin'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress, isCoinAddress } from '../../utils'
import { AppState } from '../index'
import { Field, replaceSwapState, selectCoin, setRecipient, switchCoins, typeInput } from './actions'
import { SwapState } from './reducer'

export function useSwapState(): AppState['swap'] {
  return useAppSelector((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCoinSelection: (field: Field, currency: Coin) => void
  onSwitchCoins: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
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

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchCoins,
    onCoinSelection,
    onUserInput,
    onChangeRecipient,
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
    state: TradeState
    trade: Trade
  }
  allowedSlippage: number
} {
  const account = useAccount()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { coinId: inputCoinId },
    [Field.OUTPUT]: { coinId: outputCoinId },
    recipient,
  } = useSwapState()
  const inputCoin = useCoin(inputCoinId)
  const outputCoin = useCoin(outputCoinId)
  const inputCoinBalance = Utils.d(useCoinBalance(inputCoin?.address))
  const outputCoinBalance = Utils.d(useCoinBalance(outputCoin?.address))

  const toAddress: string | null = (recipient === null ? account : recipient) ?? null

  const isExactIn: boolean = independentField === Field.INPUT

  const parsedAmount = useMemo(
    () => tryParseCoinAmount(typedValue, (isExactIn ? inputCoin : outputCoin) ?? undefined),
    [inputCoin, isExactIn, outputCoin, typedValue]
  )

  const trade = useAnimeSwapTempTrade(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    inputCoin,
    outputCoin
  )

  const allowedSlippage = 50

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!inputCoin || !outputCoin) {
      inputError = inputError ?? <Trans>Select a coin</Trans>
    }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedToAddress = isAddress(toAddress)
    if (!toAddress || !formattedToAddress) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    }
    // compare input balance to max input based on version
    const [balanceIn, amountIn] = [inputCoinBalance, trade.trade?.maximumAmountIn]
    if (balanceIn && amountIn && balanceIn.lt(amountIn)) {
      inputError = <Trans>Insufficient {inputCoin.symbol} balance</Trans>
    }

    if (trade.state === TradeState.NO_ROUTE_FOUND) {
      inputError = inputError ?? <Trans>No route found</Trans>
    }

    return inputError
  }, [account, allowedSlippage, inputCoin, outputCoin, inputCoinBalance, parsedAmount, toAddress, trade.trade])

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

function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  return null
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
  const recipient = validatedRecipient(parsedQs.recipient)
  return {
    [Field.INPUT]: {
      coinId: inputCoin === '' ? null : inputCoin ?? null,
    },
    [Field.OUTPUT]: {
      coinId: outputCoin === '' ? null : outputCoin ?? null,
    },
    typedValue,
    independentField,
    recipient,
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
        recipient: parsedSwapState.recipient,
      })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return parsedSwapState
}
