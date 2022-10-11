export interface Wallet {
  walletType: WalletType
  account: string
}

export enum WalletType {
  PETRA = 'PETRA',
  MARTIAN = 'MARTIAN',
  FEWCHA = 'FEWCHA',
  PONTEM = 'PONTEM',
  RISE = 'RISE',
}

export function getWalletName(walletType: WalletType) {
  switch (walletType) {
    case WalletType.PETRA:
      return 'Petra Wallet'
    case WalletType.MARTIAN:
      return 'Martian Wallet'
    case WalletType.FEWCHA:
      return 'Fewcha Wallet'
    case WalletType.PONTEM:
      return 'Pontem Wallet'
    case WalletType.RISE:
      return 'Rise Wallet'
  }
}
