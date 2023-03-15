import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { Coin } from 'hooks/common/Coin'
import { Pair, PairState, usePair } from 'hooks/common/Pair'
import { ReactNode, useCallback, useMemo } from 'react'
import ConnectionInstance from 'state/connection/instance'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'
import { useAccount, useCoinBalance } from 'state/wallets/hooks'
import { tryParseCoinAmount } from 'utils/tryParseCoinAmount'

import { AppState } from '../index'
import { Field, typeInput } from './actions'

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
  coinB: Coin | undefined,
  revert: boolean
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
  poolCoinPercentage?: Decimal
  error?: ReactNode
} {
  const account = useAccount()
  const chainId = useChainId()

  const { independentField, typedValue, otherTypedValue } = useMintState()

  const dependentField = independentField === Field.COIN_A ? Field.COIN_B : Field.COIN_A

  const coins: { [field in Field]?: Coin } = useMemo(() => {
    if (coinA && coinB) {
      if (revert) {
        ConnectionInstance.getPair(chainId, coinB.address, coinA.address)
      } else {
        ConnectionInstance.getPair(chainId, coinA.address, coinB.address)
      }
    }
    return {
      [Field.COIN_A]: coinA ?? undefined,
      [Field.COIN_B]: coinB ?? undefined,
    }
  }, [coinA, coinB, revert])

  const [pairState, pair] = usePair(coinA?.address, coinB?.address)
  // coin X Y is chain data sort
  const coinYdivXReserve = Utils.d(pair?.coinYReserve).div(Utils.d(pair?.coinXReserve))
  // coin A B is user select sort
  const coinBdivAReserve = revert ? Utils.d(1).div(coinYdivXReserve) : coinYdivXReserve
  const noLiquidity =
    pairState === PairState.NOT_EXISTS ||
    pair?.lpTotal === '0' ||
    pair?.coinXReserve === '0' ||
    pair?.coinYReserve === '0'

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
    } else if (independentAmount && coinA && coinB && pair) {
      const dependentCoinAmount =
        dependentField === Field.COIN_B
          ? independentAmount.mul(coinBdivAReserve).floor()
          : independentAmount.div(coinBdivAReserve).floor()
      return dependentCoinAmount
    } else {
      return undefined
    }
  }, [noLiquidity, otherTypedValue, coins, dependentField, independentAmount, coinA, coinB, pair])

  const parsedAmounts: { [field in Field]: Decimal | undefined } = useMemo(() => {
    return {
      [Field.COIN_A]: independentField === Field.COIN_A ? independentAmount : dependentAmount,
      [Field.COIN_B]: independentField === Field.COIN_B ? independentAmount : dependentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  const price = useMemo(() => {
    if (noLiquidity) {
      const { [Field.COIN_A]: CoinAAmount, [Field.COIN_B]: CoinBAmount } = parsedAmounts
      if (coinA && coinB && CoinAAmount?.greaterThan(0) && CoinBAmount?.greaterThan(0)) {
        return CoinBAmount.div(CoinAAmount).mul(Utils.pow10((coinA?.decimals ?? 0) - (coinB?.decimals ?? 0))) // B div A
      }
      return undefined
    } else {
      return pair && coinA && coinB
        ? coinBdivAReserve.mul(Utils.pow10((coinA?.decimals ?? 0) - (coinB?.decimals ?? 0)))
        : undefined
    }
  }, [coinA, noLiquidity, pair, parsedAmounts])

  // liquidity minted
  const liquidityMinted: Decimal | undefined = useMemo(() => {
    const { [Field.COIN_A]: CoinAAmount, [Field.COIN_B]: CoinBAmount } = parsedAmounts
    try {
      if (pair && pairState === PairState.EXISTS && CoinAAmount && CoinBAmount) {
        if (revert) {
          return Utils.d(pair.lpTotal).mul(CoinAAmount).div(Utils.d(pair.coinYReserve))
        } else {
          return Utils.d(pair.lpTotal).mul(CoinAAmount).div(Utils.d(pair.coinXReserve))
        }
      } else if (pairState === PairState.NOT_EXISTS && CoinAAmount && CoinBAmount) {
        return CoinAAmount.mul(CoinBAmount).sqrt().floor().sub(1000)
      }
    } catch (e) {
      console.error(error)
      return undefined
    }
  }, [parsedAmounts, pair])

  const poolCoinPercentage = useMemo(() => {
    if (liquidityMinted && pair && pairState === PairState.EXISTS) {
      return liquidityMinted.div(Utils.d(pair.lpTotal).add(liquidityMinted)).mul(Utils.pow10(2))
    } else {
      return undefined
    }
  }, [liquidityMinted, pair])

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

  if (parsedAmounts[Field.COIN_A] && parsedAmounts[Field.COIN_A].lte(1)) {
    error = error ?? <Trans>Enter an amount</Trans>
  }

  if (parsedAmounts[Field.COIN_B] && parsedAmounts[Field.COIN_B].lte(1)) {
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
    pairState,
    coinBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolCoinPercentage,
    error,
  }
}
