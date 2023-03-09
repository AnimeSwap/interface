import { getParsedChainId } from 'components/Header/NetworkSelector'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { SupportedLocale } from 'constants/locales'
import { Coin } from 'hooks/common/Coin'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { updateUserDarkMode, updateUserDeadline, updateUserLocale, updateUserSlippageTolerance } from './reducer'

export function useChainId(): SupportedChainId {
  const parsedQs = useParsedQueryString()
  const urlChainId = getParsedChainId(parsedQs)
  return useAppSelector((state) => {
    const connectChain = urlChainId ?? state.user.chainId
    return connectChain
  })
}

export function useNativeCoin(): Coin {
  const chainId = useChainId()
  const { nativeCoin } = getChainInfoOrDefault(chainId)
  return nativeCoin
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useAppSelector(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  )
  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useUserLocale(): SupportedLocale | null {
  return useAppSelector((state) => state.user.userLocale)
}

export function useUserLocaleManager(): [SupportedLocale | null, (newLocale: SupportedLocale) => void] {
  const dispatch = useAppDispatch()
  const locale = useUserLocale()

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      dispatch(updateUserLocale({ userLocale: newLocale }))
    },
    [dispatch]
  )

  return [locale, setLocale]
}

export function useSetUserSlippageTolerance(): (slippageTolerance: number) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (userSlippageTolerance: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance }))
    },
    [dispatch]
  )
}

/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): number {
  const userSlippageTolerance = useAppSelector((state) => {
    return state.user.userSlippageTolerance
  })

  return useMemo(() => userSlippageTolerance, [userSlippageTolerance])
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const dispatch = useAppDispatch()
  const userDeadline = useAppSelector((state) => state.user.userDeadline)

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [userDeadline, setUserDeadline]
}

export function useShowSwapDropdownDetails(): boolean {
  return useAppSelector((state) => state.user.showSwapDropdownDetails)
}
