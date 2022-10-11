import RISE_ICON_URL from 'assets/rise.png'
import { ConnectRise, useAccount, useWallet } from 'state/wallets/hooks'
import { getWalletName, WalletType } from 'state/wallets/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#6748FF',
  icon: RISE_ICON_URL,
  id: 'rise-option',
}

export default function RiseOption() {
  const account = useAccount()
  const walletType = useWallet()
  const isActive = walletType === WalletType.RISE && account !== undefined
  const isInstall = window.rise && window.rise.isRise
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      isInstall={isInstall}
      onClick={async () => {
        if ('rise' in window) {
          await ConnectRise()
        } else {
          window.open('https://risewallet.io/', `_blank`)
        }
      }}
      header={getWalletName(WalletType.RISE)}
    />
  )
}
