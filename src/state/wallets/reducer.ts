import { createSlice } from '@reduxjs/toolkit'
import { shallowEqual } from 'react-redux'

import { Wallet, WalletType } from './types'

export interface WalletState {
  account: string
  coinBalances: { [address: string]: string }
  selectedWallet: WalletType
  connectedWallets: Wallet[]
}

export const initialState: WalletState = {
  account: undefined,
  coinBalances: {},
  selectedWallet: WalletType.PETRA,
  connectedWallets: [],
}

const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    setAccount(state, { payload }: { payload: { account: string | undefined } }) {
      state.account = payload.account
    },
    setCoinBalances(state, { payload }: { payload: { coinBalances: { [address: string]: string } } }) {
      state.coinBalances = { ...state.coinBalances, ...payload.coinBalances }
    },
    resetCoinBalances(state, { payload }: { payload: { coinBalances: { [address: string]: string } } }) {
      state.coinBalances = payload.coinBalances
    },
    setSelectedWallet(state, { payload }: { payload: { wallet: WalletType } }) {
      state.selectedWallet = payload.wallet
    },
    addConnectedWallet(state, { payload }) {
      const existsAlready = state.connectedWallets.find((wallet) => shallowEqual(payload, wallet))
      if (!existsAlready) {
        state.connectedWallets = state.connectedWallets.concat(payload)
      }
    },
    removeConnectedWallet(state, { payload }) {
      state.connectedWallets = state.connectedWallets.filter((wallet) => !shallowEqual(wallet, payload))
    },
  },
})

export const {
  setAccount,
  setCoinBalances,
  resetCoinBalances,
  setSelectedWallet,
  addConnectedWallet,
  removeConnectedWallet,
} = walletsSlice.actions
export default walletsSlice.reducer
