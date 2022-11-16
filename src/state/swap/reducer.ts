import { createReducer } from '@reduxjs/toolkit'
import { SupportedChainId } from 'constants/chains'
import { parsedQueryString } from 'hooks/useParsedQueryString'

import { Field, replaceSwapState, selectCoin, switchCoins, typeInput } from './actions'
import { queryParametersToSwapState } from './hooks'

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly coinId: string | undefined | null
  }
  readonly [Field.OUTPUT]: {
    readonly coinId: string | undefined | null
  }
}

const initialState: SwapState = queryParametersToSwapState(parsedQueryString(), SupportedChainId.APTOS)

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(replaceSwapState, (state, { payload: { typedValue, field, inputCoinId, outputCoinId } }) => {
      return {
        [Field.INPUT]: {
          coinId: inputCoinId ?? null,
        },
        [Field.OUTPUT]: {
          coinId: outputCoinId ?? null,
        },
        independentField: field,
        typedValue,
      }
    })
    .addCase(selectCoin, (state, { payload: { coinId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (coinId === state[otherField].coinId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { coinId },
          [otherField]: { coinId: state[field].coinId },
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { coinId },
        }
      }
    })
    .addCase(switchCoins, (state) => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { coinId: state[Field.OUTPUT].coinId },
        [Field.OUTPUT]: { coinId: state[Field.INPUT].coinId },
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
)
