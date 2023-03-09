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
  BITKEEP = 'BITKEEP',
  TRUSTWALLET = 'TRUSTWALLET',
  SUIWALLET = 'SUIWALLET',
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
    case WalletType.BITKEEP:
      return 'BitKeep'
    case WalletType.TRUSTWALLET:
      return 'Trust Wallet'
    case WalletType.SUIWALLET:
      return 'Sui Wallet'
  }
}
