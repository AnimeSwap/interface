import { useWalletKit } from '@mysten/wallet-kit'
import SUIWALLET_ICON_URL from 'assets/sui_logo.svg'
import { ConnectSuiWallet, useAccount, useWallet } from 'state/wallets/hooks'
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
  const { connect, signAndExecuteTransactionBlock } = useWalletKit()
  const isActive = walletType === WalletType.SUIWALLET && account !== undefined
  const isInstall = window.suiWallet
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      isInstall={isInstall}
      onClick={async () => {
        const res = await connect('')
        if ('suiWallet' in window && window.suiWallet) {
          await ConnectSuiWallet()
        } else {
          window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', `_blank`)
        }
      }}
      header={getWalletName(WalletType.SUIWALLET)}
    />
  )
}
