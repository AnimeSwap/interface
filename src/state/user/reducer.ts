import { createSlice } from '@reduxjs/toolkit'
import { SupportedChainId } from 'constants/chains'
import { APTOS_CoinInfo, APTOS_DEVNET_CoinInfo, APTOS_TESTNET_CoinInfo } from 'constants/coinInfo'
import { SupportedLocale } from 'constants/locales'
import { Coin } from 'hooks/common/Coin'
import { Pair } from 'hooks/common/Pair'

import { DEFAULT_DEADLINE_FROM_NOW } from '../../constants/misc'
import { updateVersion } from '../global/actions'

function pairKey(coinXAddress: string, coinYAddress: string) {
  return `${coinXAddress};${coinYAddress}`
}

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

  pairs: {
    [chainId: number]: {
      // keyed by coin0Address, coin1Address
      [key: string]: Pair
    }
  }
  showSwapDropdownDetails: boolean
}

export const initialState: UserState = {
  chainId: SupportedChainId.APTOS_DEVNET,
  matchesDarkMode: false,
  userDarkMode: true,
  userLocale: null,
  userSlippageTolerance: 50, // 50BP
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  coins: {
    [SupportedChainId.APTOS]: APTOS_CoinInfo,
    [SupportedChainId.APTOS_TESTNET]: APTOS_TESTNET_CoinInfo,
    [SupportedChainId.APTOS_DEVNET]: APTOS_DEVNET_CoinInfo,
  },
  pairs: {},
  showSwapDropdownDetails: false,
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
      state.coins[coin.chainId] = state.coins[coin.chainId] || {}
      state.coins[coin.chainId][coin.address] = coin
    },
    removeCoin(state, { payload: { address, chainId } }) {
      if (!state.coins) {
        state.coins = {}
      }
      state.coins[chainId] = state.coins[chainId] || {}
      delete state.coins[chainId][address]
    },
    addPair(state, { payload: { pair } }) {
      if (pair.coinX.chainId === pair.coinY.chainId && pair.coinX.address !== pair.coinY.address) {
        const chainId = pair.coinX.chainId
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId][pairKey(pair.coinX.address, pair.coinY.address)] = pair
      }
    },
    removePair(state, { payload: { chainId, coinXAddress, coinYAddress } }) {
      if (state.pairs[chainId]) {
        delete state.pairs[chainId][pairKey(coinXAddress, coinYAddress)]
        delete state.pairs[chainId][pairKey(coinYAddress, coinXAddress)]
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
        state.chainId = SupportedChainId.APTOS_DEVNET
      }
      // update local coin list
      state.coins = {
        [SupportedChainId.APTOS]: APTOS_CoinInfo,
        [SupportedChainId.APTOS_TESTNET]: APTOS_TESTNET_CoinInfo,
        [SupportedChainId.APTOS_DEVNET]: APTOS_DEVNET_CoinInfo,
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
        state.userDeadline < 60 ||
        state.userDeadline > 180 * 60
      ) {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }

      state.lastUpdateVersionTimestamp = new Date().getTime()
    })
  },
})

export const {
  addCoin,
  removeCoin,
  addPair,
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
