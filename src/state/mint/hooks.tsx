import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { Coin, CoinAmount } from 'hooks/common/Coin'
import { Pair, usePair } from 'hooks/common/Pair'
import { ReactNode, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useAccount, useCoinBalance } from 'state/wallets/hooks'
import { tryParseCoinAmount } from 'utils/tryParseCoinAmount'

import { AppState } from '../index'
import { Field, typeInput } from './actions'

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function useMintState(): AppState['mint'] {
  return useAppSelector((state) => state.mint)
}

export function useMintActionHandlers(noLiquidity: boolean | undefined): {
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
} {
  const dispatch = useAppDispatch()

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.COIN_A, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity]
  )

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.COIN_B, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity]
  )

  return {
    onFieldAInput,
    onFieldBInput,
  }
}

export function useDerivedMintInfo(
  coinA: Coin | undefined,
  coinB: Coin | undefined
): {
  dependentField: Field
  coins: { [field in Field]?: Coin }
  pair?: Pair | null
  pairState: PairState
  coinBalances: { [field in Field]?: Decimal }
  parsedAmounts: { [field in Field]?: Decimal }
  price?: Decimal
  noLiquidity?: boolean
  liquidityMinted?: Decimal
  poolTokenPercentage?: Decimal
  error?: ReactNode
} {
  const account = useAccount()

  const { independentField, typedValue, otherTypedValue } = useMintState()

  const dependentField = independentField === Field.COIN_A ? Field.COIN_B : Field.COIN_A

  const coins: { [field in Field]?: Coin } = useMemo(
    () => ({
      [Field.COIN_A]: coinA ?? undefined,
      [Field.COIN_B]: coinB ?? undefined,
    }),
    [coinA, coinB]
  )

  const pair = usePair(coinA?.address, coinB?.address)
  const totalSupply = pair?.lpTotal

  const noLiquidity = !pair

  const coinABalance = useCoinBalance(coinA?.address)
  const coinBBalance = useCoinBalance(coinB?.address)

  const coinBalances: { [field in Field]?: Decimal } = {
    [Field.COIN_A]: Utils.d(coinABalance),
    [Field.COIN_B]: Utils.d(coinBBalance),
  }

  // amounts
  const independentAmount: Decimal | undefined = tryParseCoinAmount(typedValue, coins[independentField])
  const dependentAmount: Decimal | undefined = useMemo(() => {
    if (noLiquidity) {
      if (otherTypedValue && coins[dependentField]) {
        return tryParseCoinAmount(otherTypedValue, coins[dependentField])
      }
      return undefined
    } else if (independentAmount) {
      if (coinA && coinB && pair) {
        const dependentCoin = dependentField === Field.COIN_B ? COIN_B : COIN_A
        const dependentCoinAmount =
          dependentField === Field.COIN_B
            ? pair.priceOf(tokenA).quote(wrappedIndependentAmount)
            : pair.priceOf(tokenB).quote(wrappedIndependentAmount)
        return dependentCoin?.isNative
          ? CoinAmount.fromRawAmount(dependentCoin, dependentTokenAmount.quotient)
          : dependentTokenAmount
      }
      return undefined
    } else {
      return undefined
    }
  }, [noLiquidity, otherTypedValue, coins, dependentField, independentAmount, coinA, coinB, pair])

  const parsedAmounts: { [field in Field]: Decimal | undefined } = useMemo(() => {
    return {
      [Field.COIN_A]: independentField === Field.COIN_A ? independentAmount : dependentAmount,
      [Field.COIN_B]: independentField === Field.COIN_B ? dependentAmount : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  const price = useMemo(() => {
    if (noLiquidity) {
      const { [Field.COIN_A]: CoinAAmount, [Field.COIN_B]: CoinBAmount } = parsedAmounts
      if (CoinAAmount?.greaterThan(0) && CoinBAmount?.greaterThan(0)) {
        const value = CoinBAmount.div(CoinAAmount)
        return new Price(CoinAAmount.Coin, CoinBAmount.Coin, value.denominator, value.numerator)
      }
      return undefined
    } else {
      return pair && coinA ? pair.priceOf(coinA) : undefined
    }
  }, [coinA, noLiquidity, pair, parsedAmounts])

  // liquidity minted
  const liquidityMinted = useMemo(() => {
    const { [Field.COIN_A]: CoinAAmount, [Field.COIN_B]: CoinBAmount } = parsedAmounts
    if (pair && totalSupply && CoinAAmount && CoinBAmount) {
      try {
        return pair.getLiquidityMinted(totalSupply, CoinAAmount, CoinBAmount)
      } catch (error) {
        console.error(error)
        return undefined
      }
    } else {
      return undefined
    }
  }, [parsedAmounts, pair, totalSupply])

  const poolTokenPercentage = useMemo(() => {
    if (liquidityMinted && totalSupply) {
      return new Percent(liquidityMinted.quotient, totalSupply.add(liquidityMinted).quotient)
    } else {
      return undefined
    }
  }, [liquidityMinted, totalSupply])

  let error: ReactNode | undefined
  if (!account) {
    error = <Trans>Connect Wallet</Trans>
  }

  if (pairState === PairState.INVALID) {
    error = error ?? <Trans>Invalid pair</Trans>
  }

  if (!parsedAmounts[Field.COIN_A] || !parsedAmounts[Field.COIN_B]) {
    error = error ?? <Trans>Enter an amount</Trans>
  }

  const { [Field.COIN_A]: coinA_amount, [Field.COIN_B]: coinB_amount } = parsedAmounts

  if (coinA_amount && coinBalances?.[Field.COIN_A]?.lessThan(coinA_amount)) {
    error = <Trans>Insufficient {coins[Field.COIN_A]?.symbol} balance</Trans>
  }

  if (coinB_amount && coinBalances?.[Field.COIN_B]?.lessThan(coinB_amount)) {
    error = <Trans>Insufficient {coins[Field.COIN_B]?.symbol} balance</Trans>
  }

  return {
    dependentField,
    coins,
    pair,
    coinBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  }
}
