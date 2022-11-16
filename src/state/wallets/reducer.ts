import { createSlice } from '@reduxjs/toolkit'
import { SupportedChainId } from 'constants/chains'
import { shallowEqual } from 'react-redux'

import { Wallet, WalletType } from './types'

export interface WalletState {
  account: string
  coinBalances: { [address: string]: string }
  lpBalances: { [address: string]: string } // `${coin0.address}, ${coin1.address}`
  selectedWallet: WalletType
  walletChain: SupportedChainId
  connectedWallets: Wallet[]
}

export const initialState: WalletState = {
  account: undefined,
  coinBalances: {},
  lpBalances: {},
  selectedWallet: WalletType.MARTIAN,
  walletChain: SupportedChainId.APTOS,
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
    setLpBalances(state, { payload }: { payload: { lpBalances: { [address: string]: string } } }) {
      state.lpBalances = { ...state.lpBalances, ...payload.lpBalances }
    },
    resetLpBalances(state, { payload }: { payload: { lpBalances: { [address: string]: string } } }) {
      state.lpBalances = payload.lpBalances
    },
    setSelectedWallet(state, { payload }: { payload: { wallet: WalletType } }) {
      state.selectedWallet = payload.wallet
    },
    setWalletChain(state, { payload }: { payload: { chainId: SupportedChainId } }) {
      state.walletChain = payload.chainId
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
  setLpBalances,
  resetLpBalances,
  setSelectedWallet,
  setWalletChain,
  addConnectedWallet,
  removeConnectedWallet,
} = walletsSlice.actions
export default walletsSlice.reducer
