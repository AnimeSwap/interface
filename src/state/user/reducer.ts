import { createSlice } from '@reduxjs/toolkit'
import { SupportedChainId } from 'constants/chains'
import { APTOS_CoinInfo, APTOS_DEVNET_CoinInfo, APTOS_TESTNET_CoinInfo } from 'constants/coinInfo'
import { SupportedLocale } from 'constants/locales'
import { Coin } from 'hooks/common/Coin'
import { Pair, pairKey } from 'hooks/common/Pair'
import { isProductionEnv } from 'utils/env'

import { DEFAULT_DEADLINE_FROM_NOW, MAX_DEADLINE_FROM_NOW, MIN_DEADLINE_FROM_NOW } from '../../constants/misc'
import { updateVersion } from '../global/actions'

export interface UserState {
  chainId: SupportedChainId

  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  matchesDarkMode: boolean // whether the dark mode media query matches

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  userLocale: SupportedLocale | null

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number

  // deadline set by user in minutes, used in all txns
  userDeadline: number

  coins: {
    [chainId: number]: {
      [address: string]: Coin
    }
  }

  tempCoins: {
    [chainId: number]: {
      [address: string]: Coin
    }
  }

  pairs: {
    [chainId: number]: {
      // keyed by coin0Address, coin1Address
      [key: string]: Pair
    }
  }
  showSwapDropdownDetails: boolean
}

export const initialState: UserState = {
  chainId: SupportedChainId.APTOS,
  matchesDarkMode: false,
  userDarkMode: true,
  userLocale: null,
  userSlippageTolerance: 50, // 50BP
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  coins: {
    [SupportedChainId.APTOS]: APTOS_CoinInfo,
  },
  tempCoins: {
    [SupportedChainId.APTOS]: {},
  },
  pairs: {
    [SupportedChainId.APTOS]: {},
  },
  showSwapDropdownDetails: false,
}

if (!isProductionEnv()) {
  initialState.chainId = SupportedChainId.APTOS_TESTNET
  initialState.coins = {
    [SupportedChainId.APTOS]: APTOS_CoinInfo,
    [SupportedChainId.APTOS_TESTNET]: APTOS_TESTNET_CoinInfo,
    [SupportedChainId.APTOS_DEVNET]: APTOS_DEVNET_CoinInfo,
  }
  initialState.tempCoins = {
    [SupportedChainId.APTOS]: {},
    [SupportedChainId.APTOS_TESTNET]: {},
    [SupportedChainId.APTOS_DEVNET]: {},
  }
  initialState.pairs = {
    [SupportedChainId.APTOS]: {},
    [SupportedChainId.APTOS_TESTNET]: {},
    [SupportedChainId.APTOS_DEVNET]: {},
  }
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateChainId(state, { payload: { chainId } }) {
      state.chainId = chainId
    },
    updateUserDarkMode(state, action) {
      state.userDarkMode = action.payload.userDarkMode
    },
    updateMatchesDarkMode(state, action) {
      state.matchesDarkMode = action.payload.matchesDarkMode
    },
    updateUserLocale(state, action) {
      state.userLocale = action.payload.userLocale
    },
    updateUserSlippageTolerance(state, action) {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
    },
    updateUserDeadline(state, action) {
      state.userDeadline = action.payload.userDeadline
    },
    addCoin(state, { payload: { coin } }) {
      if (!state.coins) {
        state.coins = {}
      }
      state.coins[state.chainId] = state.coins[state.chainId] || {}
      state.coins[state.chainId][coin.address] = coin
    },
    addTempCoin(state, { payload: { tempCoin } }) {
      if (!state.tempCoins) {
        state.tempCoins = {}
      }
      state.tempCoins[state.chainId] = state.tempCoins[state.chainId] || {}
      state.tempCoins[state.chainId][tempCoin.address] = tempCoin
    },
    removeCoin(state, { payload: { address, chainId } }) {
      if (!state.coins) {
        state.coins = {}
      }
      state.coins[chainId] = state.coins[chainId] || {}
      delete state.coins[chainId][address]
    },
    updatePair(state, { payload: { pair } }: { payload: { pair: Pair } }) {
      const chainId = state.chainId
      state.pairs[chainId] = state.pairs[chainId] || {}
      state.pairs[chainId][pairKey(pair.coinX, pair.coinY)] = pair
    },
    setAllPairs(state, { payload: { pairs } }: { payload: { pairs: { [pairKey: string]: Pair } } }) {
      const chainId = state.chainId
      state.pairs[chainId] = pairs
    },
    removePair(state, { payload: { coinX, coinY } }: { payload: { coinX: string; coinY: string } }) {
      const chainId = state.chainId
      if (state.pairs[chainId]) {
        delete state.pairs[chainId][pairKey(coinX, coinY)]
        delete state.pairs[chainId][pairKey(coinY, coinX)]
      }
    },
    setShowSwapDropdownDetails(
      state,
      { payload: { showSwapDropdownDetails } }: { payload: { showSwapDropdownDetails: boolean } }
    ) {
      state.showSwapDropdownDetails = showSwapDropdownDetails
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      // init chainId
      if (
        ![SupportedChainId.APTOS, SupportedChainId.APTOS_TESTNET, SupportedChainId.APTOS_DEVNET].includes(state.chainId)
      ) {
        state.chainId = SupportedChainId.APTOS
        if (!isProductionEnv()) {
          state.chainId = SupportedChainId.APTOS_TESTNET
        }
      }
      // update local coin list
      state.coins = {
        [SupportedChainId.APTOS]: {
          ...APTOS_CoinInfo,
          ...state.coins[SupportedChainId.APTOS],
          ...APTOS_CoinInfo,
        },
      }
      state.tempCoins = {
        [SupportedChainId.APTOS]: {},
      }
      if (!isProductionEnv()) {
        state.coins = {
          [SupportedChainId.APTOS]: {
            ...APTOS_CoinInfo,
            ...state.coins[SupportedChainId.APTOS],
            ...APTOS_CoinInfo,
          },
          [SupportedChainId.APTOS_TESTNET]: {
            ...APTOS_TESTNET_CoinInfo,
            ...state.coins[SupportedChainId.APTOS_TESTNET],
            ...APTOS_TESTNET_CoinInfo,
          },
          [SupportedChainId.APTOS_DEVNET]: {
            ...APTOS_DEVNET_CoinInfo,
            ...state.coins[SupportedChainId.APTOS_DEVNET],
            ...APTOS_DEVNET_CoinInfo,
          },
        }
        state.tempCoins = {
          [SupportedChainId.APTOS]: {},
        }
      }

      // init local pair
      state.pairs[SupportedChainId.APTOS] = state.pairs[SupportedChainId.APTOS] || {}
      if (!isProductionEnv()) {
        state.pairs[SupportedChainId.APTOS_TESTNET] = state.pairs[SupportedChainId.APTOS_TESTNET] || {}
        state.pairs[SupportedChainId.APTOS_DEVNET] = state.pairs[SupportedChainId.APTOS_DEVNET] || {}
      }

      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (
        typeof state.userSlippageTolerance !== 'number' ||
        !Number.isInteger(state.userSlippageTolerance) ||
        state.userSlippageTolerance < 0 ||
        state.userSlippageTolerance > 5000
      ) {
        state.userSlippageTolerance = 50
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (
        typeof state.userDeadline !== 'number' ||
        !Number.isInteger(state.userDeadline) ||
        state.userDeadline < MIN_DEADLINE_FROM_NOW ||
        state.userDeadline > MAX_DEADLINE_FROM_NOW
      ) {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }

      state.lastUpdateVersionTimestamp = new Date().getTime()
    })
  },
})

export const {
  addCoin,
  addTempCoin,
  removeCoin,
  updatePair,
  setAllPairs,
  removePair,
  updateChainId,
  updateMatchesDarkMode,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserLocale,
  updateUserSlippageTolerance,
  setShowSwapDropdownDetails,
} = userSlice.actions
export default userSlice.reducer
