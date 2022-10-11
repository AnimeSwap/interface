import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'

export class Coin {
  public address: string
  public decimals: number
  public symbol: string
  public name: string
  public logoURL: string[]
  public projectURL?: string
  public extensions?: object
}

export class CoinAmount<T extends Coin> {
  public coin: T
  public amount: Decimal

  constructor(coin: T, amount: Decimal) {
    this.coin = coin
    this.amount = Utils.d(amount)
  }

  pretty(decimals?: number): string {
    return this.amount
      .div(Utils.pow10(this.coin.decimals))
      .toSignificantDigits(decimals || 6)
      .toString()
  }

  prettyWithSymbol(decimals?: number): string {
    return (
      this.amount
        .div(Utils.pow10(this.coin.decimals))
        .toSignificantDigits(decimals || 6)
        .toString() +
      ' ' +
      this.coin.symbol
    )
  }
}

export class ImportCoinList {
  name: string
  logoURL: string
  coins: Coin[]
}

export class Price<T extends Coin, U extends Coin> {
  public readonly baseCurrency: T
  public readonly quoteCurrency: U
  public readonly baseAmount: Decimal
  public readonly quoteAmount: Decimal
  public readonly raw: Decimal

  public constructor(baseCurrency: T, quoteCurrency: U, baseAmount: Decimal, quoteAmount: Decimal) {
    this.baseCurrency = baseCurrency
    this.quoteCurrency = quoteCurrency
    this.baseAmount = baseAmount
    this.quoteAmount = quoteAmount
    this.raw = quoteAmount.div(baseAmount)
  }

  public invert(): Decimal {
    return new Decimal(1).div(this.raw)
  }
}

export function useCoin(address?: string | null): Coin | null | undefined {
  const chainId = useChainId()
  return useAppSelector((state) => state.user.coins[chainId][address])
}

export function useCoinList(): Coin[] {
  const chainId = useChainId()
  const coinMap = useAppSelector((state) => state.user.coins[chainId])
  return Object.values(coinMap)
}

export function useCoinMap() {
  const chainId = useChainId()
  const coinMap = useAppSelector((state) => state.user.coins[chainId])
  return coinMap
}
