import { useMemo } from 'react'
import { useAppSelector } from 'state/hooks'

import { AppState } from '../index'

export function useAllLists(): AppState['lists']['byUrl'] {
  return useAppSelector((state) => state.lists.byUrl)
}

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList() {
  // const activeListUrls = useActiveListUrls()
  // Azard: token list url source
  const activeListUrls = []
  const activeTokens = []
  return activeTokens
}
