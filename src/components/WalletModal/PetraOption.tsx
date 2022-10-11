import PETRA_ICON_URL from 'assets/petra.svg'
import { ConnectPetra, useAccount, useWallet } from 'state/wallets/hooks'
import { getWalletName, WalletType } from 'state/wallets/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#6748FF',
  icon: PETRA_ICON_URL,
  id: 'petra-option',
}

export default function PetraOption() {
  const account = useAccount()
  const walletType = useWallet()
  const isActive = walletType === WalletType.PETRA && account !== undefined
  const isInstall = 'aptos' in window
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      isInstall={isInstall}
      onClick={async () => {
        if ('aptos' in window) {
          await ConnectPetra()
        } else {
          window.open('https://petra.app/', `_blank`)
        }
      }}
      header={getWalletName(WalletType.PETRA)}
    />
  )
}
