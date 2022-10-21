import BITKEEP_ICON_URL from 'assets/bitkeep.png'
import { ConnectBitkeep, useAccount, useWallet } from 'state/wallets/hooks'
import { getWalletName, WalletType } from 'state/wallets/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#6748FF',
  icon: BITKEEP_ICON_URL,
  id: 'bitkeep-option',
}

export default function BitkeepOption() {
  const account = useAccount()
  const walletType = useWallet()
  const isActive = walletType === WalletType.BITKEEP && account !== undefined
  const isInstall = window.bitkeep && window.bitkeep?.aptos
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      isInstall={isInstall}
      onClick={async () => {
        if ('bitkeep' in window && window.bitkeep?.aptos) {
          await ConnectBitkeep()
        } else {
          window.open('https://bitkeep.com/en/download?type=2', `_blank`)
        }
      }}
      header={getWalletName(WalletType.BITKEEP)}
    />
  )
}
