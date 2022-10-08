export interface Wallet {
  walletType: WalletType
  account: string
}

export enum WalletType {
  PETRA = 'PETRA',
  MARTIAN = 'MARTIAN',
}

export function getWalletName(walletType: WalletType) {
  switch (walletType) {
    case WalletType.PETRA:
      return 'Petra Wallet'
    case WalletType.MARTIAN:
      return 'Martian Wallet'
  }
}
