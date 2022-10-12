import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export const selectCoin = createAction<{ field: Field; coinId: string }>('swap/selectCoin')
export const switchCoins = createAction<void>('swap/switchCoins')
export const typeInput = createAction<{ field: Field; typedValue: string }>('swap/typeInput')
export const replaceSwapState = createAction<{
  field: Field
  typedValue: string
  inputCoinId?: string
  outputCoinId?: string
}>('swap/replaceSwapState')
