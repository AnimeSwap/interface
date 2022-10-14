import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'

export interface Coin {
  address: string
  decimals: number
  symbol: string
  name: string
  logoURL: string[]
  projectURL?: string
  extensions?: object
}

export class CoinAmount<T extends Coin> {
  public coin: T
  public amount: Decimal

  constructor(coin: T, amount: Decimal) {
    this.coin = coin
    this.amount = Utils.d(amount)
  }

  pretty(decimals?: number): string {
    const significant = decimals || 6
    const value = this.amount.div(Utils.pow10(this.coin.decimals))
    if (value.greaterThan(Utils.pow10(significant))) {
      return value.toDP(0).toString()
    } else {
      return value.toSD(significant).toString()
    }
  }

  prettyWithSymbol(decimals?: number): string {
    return this.pretty(decimals) + ' ' + this.coin.symbol
  }
}

export function amountPretty(amount: Decimal, coinDecimal: number, decimals?: number): string {
  const significant = decimals || 6
  const value = amount.div(Utils.pow10(coinDecimal))
  if (value.greaterThan(Utils.pow10(significant))) {
    return value.toDP(0).toString()
  } else {
    return value.toSD(significant).toString()
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
