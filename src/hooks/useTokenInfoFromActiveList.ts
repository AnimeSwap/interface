import { useMemo } from 'react'
import { useCombinedActiveList } from 'state/lists/hooks'
import { useChainId } from 'state/user/hooks'

import { Coin } from './common/Coin'

/**
 * Returns a WrappedTokenInfo from the active token lists when possible,
 * or the passed token otherwise. */
export function useTokenInfoFromActiveList(coin: Coin) {
  const chainId = useChainId()
  const activeList = useCombinedActiveList()

  return useMemo(() => {
    if (!chainId) return
    try {
      return activeList[chainId][coin.address].token
    } catch (e) {
      return coin
    }
  }, [activeList, chainId, coin])
}
