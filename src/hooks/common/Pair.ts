import { useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'

export interface Pair {
  coinX: string
  coinY: string
  lpTotal: string
  coinXReserve: string
  coinYReserve: string
}

export function pairKey(coinXAddress: string, coinYAddress: string) {
  return `${coinXAddress}, ${coinYAddress}`
}

export function usePair(coinA: string, coinB: string): Pair | null | undefined {
  const chainId = useChainId()
  return useAppSelector(
    (state) => state.user.pairs[chainId][pairKey(coinA, coinB)] || state.user.pairs[chainId][pairKey(coinB, coinA)]
  )
}
