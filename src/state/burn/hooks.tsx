import { ReactNode, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { AppState } from '../index'
import { Field, typeInput } from './actions'

export function useBurnState(): AppState['burn'] {
  return useAppSelector((state) => state.burn)
}

export function useDerivedBurnInfo() {}

export function useBurnActionHandlers(): {
  onUserInput: (field: Field, typedValue: string) => void
} {
  const dispatch = useAppDispatch()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  return {
    onUserInput,
  }
}
