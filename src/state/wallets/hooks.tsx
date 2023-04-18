import { Utils } from '@animeswap.org/v1-sdk'
import { TransactionBlock } from '@mysten/sui.js'
import { useWalletKit } from '@mysten/wallet-kit'
import { isSuiChain, SupportedChainId } from 'constants/chains'
import { Coin, CoinAmount, useCoin } from 'hooks/common/Coin'
import { useCallback } from 'react'
import store from 'state'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { addConnectedWallet, setAccount, setSelectedWallet, setWalletChain } from './reducer'
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

export function useWalletNetwork(): SupportedChainId {
  return useAppSelector((state) => state.wallets.walletChain)
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

export async function AutoConnectAptosWallets() {
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
    case WalletType.PONTEM:
      if (await AutoConnectPontem()) return
      break
    case WalletType.BITKEEP:
      if (await AutoConnectBitkeep()) return
      break
    case WalletType.TRUSTWALLET:
      if (await AutoConnectTrustWallet()) return
      break
  }
  // auto connect wallet in order
  if (await AutoConnectBitkeep()) return
  if (await AutoConnectTrustWallet()) return
  if (await AutoConnectMartian()) return
  if (await AutoConnectPetra()) return
  // if (await AutoConnectFewcha()) return
  if (await AutoConnectRise()) return
  if (await AutoConnectPontem()) return
}

export async function ConnectPetra() {
  try {
    const res = await window.aptos.connect()
    store.dispatch(setSelectedWallet({ wallet: WalletType.PETRA }))
    store.dispatch(setAccount({ account: res.address }))
    console.log('Petra wallet connect success')
    const network = await window.aptos.network()
    store.dispatch(setWalletChain({ chainId: PetraNetworkToChainId(network) }))
    window.aptos.onNetworkChange((network) => {
      if (store.getState().wallets.selectedWallet === WalletType.PETRA) {
        store.dispatch(setWalletChain({ chainId: PetraNetworkToChainId(network.networkName) }))
      }
    })
    return true
  } catch (error) {
    console.error(error)
  }
}

function PetraNetworkToChainId(network: string) {
  switch (network) {
    case 'Mainnet':
      return SupportedChainId.APTOS
    case 'Testnet':
      return SupportedChainId.APTOS_TESTNET
    case 'Devnet':
      return SupportedChainId.APTOS_DEVNET
    default:
      return SupportedChainId.APTOS
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
    const network = await window.martian.network()
    store.dispatch(setWalletChain({ chainId: MartianNetworkToChainId(network) }))
    window.martian.onNetworkChange((network) => {
      if (store.getState().wallets.selectedWallet === WalletType.MARTIAN) {
        store.dispatch(setWalletChain({ chainId: MartianNetworkToChainId(network) }))
      }
    })
    window.martian.onAccountChange((address) => {
      store.dispatch(setAccount({ account: address }))
    })

    return true
  } catch (error) {
    console.error(error)
  }
}

function MartianNetworkToChainId(network: string) {
  switch (network) {
    case 'Mainnet':
      return SupportedChainId.APTOS
    case 'Testnet':
      return SupportedChainId.APTOS_TESTNET
    case 'Devnet':
      return SupportedChainId.APTOS_DEVNET
    default:
      return SupportedChainId.APTOS
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
    const network = await window.pontem.network()
    store.dispatch(setWalletChain({ chainId: Number.parseInt(network.chainId) }))
    window.pontem.onChangeNetwork((network) => {
      if (store.getState().wallets.selectedWallet === WalletType.PONTEM) {
        store.dispatch(setWalletChain({ chainId: Number.parseInt(network.chainId) }))
      }
    })
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

export async function ConnectTrustWallet() {
  try {
    const res = await window.trustwallet.aptos.connect()
    store.dispatch(setSelectedWallet({ wallet: WalletType.TRUSTWALLET }))
    store.dispatch(setAccount({ account: res.address }))
    console.log('TrustWallet connect success')
    return true
  } catch (error) {
    console.error(error)
  }
}

export async function AutoConnectTrustWallet() {
  if (!(window.trustwallet && window.trustwallet?.aptos)) {
    return false
  }
  try {
    if (await ConnectTrustWallet()) {
      console.log('TrustWallet auto connected')
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

export const SignAndSubmitTransaction = async (chainId: SupportedChainId, transaction: any) => {
  if (isSuiChain(chainId)) {
    return await SignAndSubmitSuiTransaction(chainId, transaction)
  }
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
    case WalletType.TRUSTWALLET:
      const trustwallet = await window.trustwallet.aptos.signAndSubmitTransaction(payload)
      console.log('TrustWallet tx', trustwallet)
      return trustwallet.hash
    default:
      break
  }
}

export async function AutoConnectSuiWallets() {
  // first use previous wallet
  const prevWallet = store.getState().wallets.selectedWallet
  switch (prevWallet) {
    case WalletType.SUIWALLET:
      if (await AutoConnectSuiWallet()) return
      break
    case WalletType.MARTIAN:
      if (await AutoConnectSuiMartian()) return
      break
  }
  // auto connect wallet in order
  if (await AutoConnectSuiWallet()) return
  if (await AutoConnectSuiMartian()) return
}

export async function ConnectSuiMartian() {
  try {
    const res = await window.martian.sui.connect()
    store.dispatch(setSelectedWallet({ wallet: WalletType.MARTIAN }))
    store.dispatch(setAccount({ account: res.address }))
    console.log('Martian Sui wallet connect success')
    let network = 'sui:testnet'
    try {
      // temp fix
      network = await window.martian.sui.network()
    } catch (e) {
      //
    }
    store.dispatch(setWalletChain({ chainId: SuiMartianNetworkToChainId(network) }))
    window.martian.sui.onNetworkChange((network) => {
      if (store.getState().wallets.selectedWallet === WalletType.MARTIAN) {
        store.dispatch(setWalletChain({ chainId: SuiMartianNetworkToChainId(network) }))
      }
    })
    window.martian.sui.onAccountChange((address) => {
      store.dispatch(setAccount({ account: address }))
    })

    return true
  } catch (error) {
    console.error(error)
  }
}

function SuiMartianNetworkToChainId(network: string) {
  switch (network) {
    case 'sui:mainnet':
      return SupportedChainId.SUI
    case 'sui:testnet':
    case 'sui:custom':
      return SupportedChainId.SUI_TESTNET
    case 'sui:devnet':
      return SupportedChainId.SUI_DEVNET
    default:
      return SupportedChainId.SUI
  }
}

export async function AutoConnectSuiMartian() {
  if (!('martian' in window)) {
    return false
  }
  try {
    if (await ConnectSuiMartian()) {
      console.log('Martian Sui auto connected')
      return true
    }
  } catch (error) {
    console.error(error)
  }
  return false
}

export async function ConnectSuiWallet() {
  const { connect } = useWalletKit()
  const { currentAccount } = useWalletKit()
  try {
    await connect('Sui Wallet')
    store.dispatch(setSelectedWallet({ wallet: WalletType.SUIWALLET }))
    store.dispatch(setAccount({ account: currentAccount.address }))
    console.log('Sui wallet connect success')
    return true
  } catch (error) {
    console.error(error)
  }
}

export async function AutoConnectSuiWallet() {
  // if (!('suiWallet' in window)) {
  //   return false
  // }
  try {
    if (await ConnectSuiWallet()) {
      console.log('SuiWallet auto connected')
      return true
    }
  } catch (error) {
    console.error(error)
  }
  return false
}

export const SignAndSubmitSuiTransaction = async (
  chainId: SupportedChainId,
  transaction: any,
  signAndExecuteTransactionBlock?: any
) => {
  const transactionBlock: TransactionBlock = transaction?.length === undefined ? transaction : transaction[0]
  switch (store.getState().wallets.selectedWallet) {
    case WalletType.MARTIAN:
      const martianRes = await window.martian.sui.connect(['viewAccount', 'suggestTransactions'])
      // const sender = martianRes.address
      console.log('Martian tx', transactionBlock)
      // const martianTx = await window.martian.sui.generateTransaction(payload)
      const martianTxHash = await window.martian.sui.signAndExecuteTransactionBlock({
        transactionBlockSerialized: transactionBlock.serialize(),
        options: {
          showEffects: true,
        },
      })
      console.log(martianTxHash)
      return martianTxHash?.digest
    case WalletType.SUIWALLET:
      const suiWalletTxHash = await signAndExecuteTransactionBlock({ transactionBlock })
      console.log(suiWalletTxHash)
      return suiWalletTxHash?.digest?.toString()
    default:
      break
  }
}
