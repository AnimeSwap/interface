import TRUSTWALLET_ICON_URL from 'assets/trustwallet.png'
import { ConnectTrustWallet, useAccount, useWallet } from 'state/wallets/hooks'
import { getWalletName, WalletType } from 'state/wallets/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#6748FF',
  icon: TRUSTWALLET_ICON_URL,
  id: 'trustwallet-option',
}

export default function TrustWalletOption() {
  const account = useAccount()
  const walletType = useWallet()
  const isActive = walletType === WalletType.TRUSTWALLET && account !== undefined
  const isInstall = window.trustwallet && window.trustwallet?.aptos
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      isInstall={isInstall}
      onClick={async () => {
        if ('trustwallet' in window && window.trustwallet?.aptos) {
          await ConnectTrustWallet()
        } else {
          window.open('https://trustwallet.com/download', `_blank`)
        }
      }}
      header={getWalletName(WalletType.TRUSTWALLET)}
    />
  )
}
