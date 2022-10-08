import PETRA_ICON_URL from 'assets/petra.jpg'
import { ConnectPetra, useAccount, useWallet } from 'state/wallets/hooks'
import { getWalletName, WalletType } from 'state/wallets/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#6748FF',
  icon: PETRA_ICON_URL,
  id: 'petra',
}

export default function PetraOption() {
  const account = useAccount()
  const walletType = useWallet()
  const isActive = walletType === WalletType.PETRA && account !== undefined
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
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
