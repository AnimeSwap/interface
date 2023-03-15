import { Utils } from '@animeswap.org/v1-sdk'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import ConnectionInstance from 'state/connection/instance'
import { useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'

export interface Pair {
  coinX: string
  coinY: string
  lpTotal: string
  coinXReserve: string
  coinYReserve: string
  APR?: number
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

export function useNativePrice() {
  // rely on Header/index ConnectionInstance.getPair(chainId, nativeCoin.address, stableCoin.address)
  const chainId = useChainId()
  const { nativeCoin, stableCoin } = getChainInfoOrDefault(chainId)
  const pair = usePair(nativeCoin.address, stableCoin.address)
  if (pair[0] === PairState.EXISTS) {
    return Utils.d(pair[1].coinYReserve).div(Utils.d(pair[1].coinXReserve))
  } else {
    return Utils.d(0)
  }
}

export function useAniPrice() {
  // rely on Header/index ConnectionInstance.getPair(chainId, aniCoin.address, stableCoin.address)
  const chainId = useChainId()
  const nativePrice = useNativePrice()
  const { nativeCoin, aniCoin } = getChainInfoOrDefault(chainId)
  const pair = usePair(nativeCoin.address, aniCoin.address)
  if (pair[0] === PairState.EXISTS) {
    return Utils.d(pair[1].coinXReserve).div(Utils.d(pair[1].coinYReserve)).mul(nativePrice)
  } else {
    return Utils.d(0)
  }
}
