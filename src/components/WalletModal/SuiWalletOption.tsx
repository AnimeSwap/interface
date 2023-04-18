import { ConnectButton, useWalletKit } from '@mysten/wallet-kit'
import SUIWALLET_ICON_URL from 'assets/sui_logo.svg'
import store from 'state'
import { useAccount, useWallet } from 'state/wallets/hooks'
import { setAccount, setSelectedWallet } from 'state/wallets/reducer'
import { getWalletName, WalletType } from 'state/wallets/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#6748FF',
  icon: SUIWALLET_ICON_URL,
  id: 'suiwallet-option',
}

export default function TrustWalletOption() {
  const account = useAccount()
  const walletType = useWallet()
  const { connect, signAndExecuteTransactionBlock, currentAccount } = useWalletKit()
  const isActive = walletType === WalletType.SUIWALLET && account !== undefined
  const isInstall = true
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      isInstall={isInstall}
      onClick={async () => {
        if (isInstall) {
          try {
            await connect('Sui Wallet')
            store.dispatch(setSelectedWallet({ wallet: WalletType.SUIWALLET }))
            store.dispatch(setAccount({ account: currentAccount.address }))
            console.log('Sui wallet connect success')
            return true
          } catch (error) {
            console.error(error)
          }
        } else {
          window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', `_blank`)
        }
      }}
      header={getWalletName(WalletType.SUIWALLET)}
    />
  )
}
