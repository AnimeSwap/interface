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

export function useLpBalance(pairKey: string): string | undefined {
  return useAppSelector((state) => state.wallets.lpBalances[pairKey])
}

export function useAllLpBalance(): { [pairKey: string]: string } {
  return useAppSelector((state) => state.wallets.lpBalances)
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
    // case WalletType.FEWCHA:
    //   if (await AutoConnectFewcha()) return
    //   break
    case WalletType.RISE:
      if (await AutoConnectRise()) return
      break
    case WalletType.BITKEEP:
      if (await AutoConnectBitkeep()) return
      break
    case WalletType.PONTEM:
      if (await AutoConnectPontem()) return
      break
  }
  // auto connect wallet in order
  if (await AutoConnectMartian()) return
  if (await AutoConnectPetra()) return
  // if (await AutoConnectFewcha()) return
  if (await AutoConnectRise()) return
  if (await AutoConnectBitkeep()) return
  if (await AutoConnectPontem()) return
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

export async function ConnectFewcha() {
  try {
    const res = await window.fewcha.connect()
    if (res.status !== 200) return false
    store.dispatch(setSelectedWallet({ wallet: WalletType.FEWCHA }))
    store.dispatch(setAccount({ account: res.data.address }))
    console.log('Fewcha wallet connect success')
    return true
  } catch (error) {
    console.error(error)
  }
}

export async function AutoConnectFewcha() {
  if (!('fewcha' in window)) {
    return false
  }
  try {
    if (await ConnectFewcha()) {
      console.log('Fewcha auto connected')
      return true
    }
  } catch (error) {
    console.error(error)
  }
  return false
}

export async function ConnectPontem() {
  try {
    const res = await window.pontem.connect()
    store.dispatch(setSelectedWallet({ wallet: WalletType.PONTEM }))
    store.dispatch(setAccount({ account: res.address }))
    console.log('Pontem wallet connect success')
    return true
  } catch (error) {
    console.error(error)
  }
}

export async function AutoConnectPontem() {
  if (!('pontem' in window)) {
    return false
  }
  try {
    if (await ConnectPontem()) {
      console.log('Pontem auto connected')
      return true
    }
  } catch (error) {
    console.error(error)
  }
  return false
}

export async function ConnectRise() {
  try {
    const res = await window.rise.connect()
    store.dispatch(setSelectedWallet({ wallet: WalletType.RISE }))
    store.dispatch(setAccount({ account: window.rise.address }))
    console.log('Rise wallet connect success')
    return true
  } catch (error) {
    console.error(error)
  }
}

export async function AutoConnectRise() {
  if (!('rise' in window)) {
    return false
  }
  try {
    if (await ConnectRise()) {
      console.log('Rise auto connected')
      return true
    }
  } catch (error) {
    console.error(error)
  }
  return false
}

export async function ConnectBitkeep() {
  try {
    const res = await window.bitkeep.aptos.connect()
    store.dispatch(setSelectedWallet({ wallet: WalletType.BITKEEP }))
    store.dispatch(setAccount({ account: res.address }))
    console.log('BitKeep connect success')
    return true
  } catch (error) {
    console.error(error)
  }
}

export async function AutoConnectBitkeep() {
  if (!(window.bitkeep && window.bitkeep?.aptos)) {
    return false
  }
  try {
    if (await ConnectBitkeep()) {
      console.log('BitKeep auto connected')
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
      console.log('Petra tx', payload)
      const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload)
      console.log(pendingTransaction)
      return pendingTransaction.hash
    case WalletType.MARTIAN:
      const martianRes = await window.martian.connect()
      const sender = martianRes.address
      console.log('Martian tx', payload)
      const martianTx = await window.martian.generateTransaction(sender, payload, {
        expiration_timestamp_secs: (store.getState().user.userDeadline + Math.floor(Date.now() / 1000)).toString(),
      })
      const martianTxHash = await window.martian.signAndSubmitTransaction(martianTx)
      console.log(martianTxHash)
      return martianTxHash
    case WalletType.FEWCHA:
      const fewchaTx = await window.fewcha.generateTransaction(payload)
      if (fewchaTx.status !== 200) {
        throw new Error('Fewcha tx error')
      }
      const fewchaTxHash = await window.fewcha.signAndSubmitTransaction(fewchaTx.data)
      console.log('Fewcha tx', fewchaTxHash)
      break
    case WalletType.PONTEM:
      const pontemTx = await window.pontem.signAndSubmit(payload)
      console.log('Pontem tx', pontemTx)
      return pontemTx?.result?.hash
    case WalletType.RISE:
      const riseTx = await window.rise.signAndSubmitTransaction(payload)
      console.log('Rise tx', riseTx)
      return riseTx.hash
    case WalletType.BITKEEP:
      const bitkeepTx = await window.bitkeep.aptos.signAndSubmitTransaction(payload)
      console.log('BitKeep tx', bitkeepTx)
      return bitkeepTx.hash
    default:
      break
  }
}
