import { createAction } from '@reduxjs/toolkit'

export enum Field {
  COIN_A = 'COIN_A',
  COIN_B = 'COIN_B',
}

export const typeInput = createAction<{ field: Field; typedValue: string; noLiquidity: boolean }>('mint/typeInputMint')
export const resetMintState = createAction<void>('mint/resetMintState')
