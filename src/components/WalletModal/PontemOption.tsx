import PONTEM_ICON_URL from 'assets/pontem.svg'
import { ConnectPontem, useAccount, useWallet } from 'state/wallets/hooks'
import { getWalletName, WalletType } from 'state/wallets/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#6748FF',
  icon: PONTEM_ICON_URL,
  id: 'pontem-option',
}

export default function PontemOption() {
  const account = useAccount()
  const walletType = useWallet()
  const isActive = walletType === WalletType.PONTEM && account !== undefined
  const isInstall = 'pontem' in window
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      isInstall={isInstall}
      onClick={async () => {
        if ('pontem' in window) {
          await ConnectPontem()
        } else {
          window.open('https://pontem.network/pontem-wallet', '_blank')
        }
      }}
      header={getWalletName(WalletType.PONTEM)}
    />
  )
}
