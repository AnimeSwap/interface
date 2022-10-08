import { Utils } from '@animeswap.org/v1-sdk'
import { Coin, CoinAmount, useCoin } from 'hooks/common/Coin'
import { useCallback } from 'react'
import store from 'state'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { addConnectedWallet, setAccount, setSelectedWallet } from './reducer'
import { Wallet, WalletType } from './types'

export function useCoinBalance(address: string): string | undefined {
  return useAppSelector((state) => state.wallets.coinBalances[address])
}

export function useCoinAmount(address: string): CoinAmount<Coin> {
  const coinBalance = useCoinBalance(address)
  const coin = useCoin(address)
  return new CoinAmount(coin, Utils.d(coinBalance))
}

export function useAllCoinBalance(): { [address: string]: string } {
  return useAppSelector((state) => state.wallets.coinBalances)
}

export function useAccount(): string | undefined {
  return useAppSelector((state) => state.wallets.account)
}

export function useWallet(): WalletType {
  return useAppSelector((state) => state.wallets.selectedWallet)
}

export function useConnectedWallets(): [Wallet[], (wallet: Wallet) => void] {
  const dispatch = useAppDispatch()
  const connectedWallets = useAppSelector((state) => state.wallets.connectedWallets)
  const addWallet = useCallback(
    (wallet: Wallet) => {
      dispatch(addConnectedWallet(wallet))
    },
    [dispatch]
  )
  return [connectedWallets, addWallet]
}

export async function AutoConnectWallets() {
  // first use previous wallet
  const prevWallet = store.getState().wallets.selectedWallet
  switch (prevWallet) {
    case WalletType.PETRA:
      if (await AutoConnectPetra()) return
      break
    case WalletType.MARTIAN:
      if (await AutoConnectMartian()) return
      break
  }
  // auto connect wallet in order
  if (await AutoConnectPetra()) return
  if (await AutoConnectMartian()) return
}

export async function ConnectPetra() {
  try {
    const res = await window.aptos.connect()
    store.dispatch(setSelectedWallet({ wallet: WalletType.PETRA }))
    store.dispatch(setAccount({ account: res.address }))
    console.log('Petra wallet connect success')
    return true
  } catch (error) {
    console.error(error)
  }
}

export async function AutoConnectPetra() {
  if (!('aptos' in window)) {
    return false
  }
  try {
    if (await ConnectPetra()) {
      console.log('Petra auto connected')
      return true
    }
  } catch (error) {
    console.error(error)
  }
}

export async function ConnectMartian() {
  try {
    const res = await window.martian.connect()
    store.dispatch(setSelectedWallet({ wallet: WalletType.MARTIAN }))
    store.dispatch(setAccount({ account: res.address }))
    console.log('Martian wallet connect success')
    return true
  } catch (error) {
    console.error(error)
  }
}

export async function AutoConnectMartian() {
  if (!('martian' in window)) {
    return false
  }
  try {
    if (await ConnectMartian()) {
      console.log('Martian auto connected')
      return true
    }
  } catch (error) {
    console.error(error)
  }
  return false
}

export const ResetConnection = () => {
  store.dispatch(setSelectedWallet({ wallet: WalletType.PETRA }))
  store.dispatch(setAccount({ account: undefined }))
}

export const SignAndSubmitTransaction = async (transaction: any) => {
  const payload = Object.assign({}, transaction)
  switch (store.getState().wallets.selectedWallet) {
    case WalletType.PETRA:
      await window.aptos.connect()
      payload.arguments = payload.arguments.map(String)
      console.log('Petra tx', payload)
      const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload)
      console.log(pendingTransaction)
      return pendingTransaction.hash
    case WalletType.MARTIAN:
      const martianRes = await window.martian.connect()
      const sender = martianRes.address
      console.log('Martian tx', payload)
      const tx = await window.martian.generateTransaction(sender, payload)
      const txnHash = await window.martian.signAndSubmitTransaction(tx)
      console.log(txnHash)
      return txnHash
    default:
      // TODO[Azard] open wallet
      break
  }
}
