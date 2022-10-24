import { useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'

export interface Pair {
  coinX: string
  coinY: string
  lpTotal: string
  coinXReserve: string
  coinYReserve: string
  APY?: number
}

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function pairKey(coinXAddress: string, coinYAddress: string) {
  return `${coinXAddress}, ${coinYAddress}`
}

export function usePair(coinA: string, coinB: string): [PairState, Pair | null | undefined] {
  const chainId = useChainId()
  const pair = useAppSelector(
    (state) => state.user.pairs[chainId][pairKey(coinA, coinB)] || state.user.pairs[chainId][pairKey(coinB, coinA)]
  )
  let pairState: PairState = PairState.LOADING
  if (pair === undefined) {
    pairState = PairState.NOT_EXISTS
  }
  if (pair) {
    pairState = PairState.EXISTS
  }
  return [pairState, pair]
}
