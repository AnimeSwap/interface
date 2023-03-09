import MARTIAN_ICON_URL from 'assets/martian.png'
import { isSuiChain } from 'constants/chains'
import { useChainId } from 'state/user/hooks'
import { ConnectMartian, ConnectSuiMartian, useAccount, useWallet } from 'state/wallets/hooks'
import { getWalletName, WalletType } from 'state/wallets/types'

import Option from './Option'

const BASE_PROPS = {
  color: '#6748FF',
  icon: MARTIAN_ICON_URL,
  id: 'martian-option',
}

export default function MartianOption() {
  const account = useAccount()
  const walletType = useWallet()
  const chainId = useChainId()
  const isActive = walletType === WalletType.MARTIAN && account !== undefined
  const isInstall = 'martian' in window
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      isInstall={isInstall}
      onClick={async () => {
        if ('martian' in window) {
          if (isSuiChain(chainId)) {
            await ConnectSuiMartian()
          } else {
            await ConnectMartian()
          }
        } else {
          window.open('https://www.martianwallet.xyz/', '_blank')
        }
      }}
      header={getWalletName(WalletType.MARTIAN)}
    />
  )
}
