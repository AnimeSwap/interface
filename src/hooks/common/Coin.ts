import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import ConnectionInstance from 'state/connection/instance'
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

  pretty(decimals?: number, lessThanFlag?: boolean): string {
    const significant = decimals || 6
    const value = this.amount.div(Utils.pow10(this.coin?.decimals))
    if (value.greaterThan(Utils.pow10(significant))) {
      return value.toDP(0).toString()
    } else if (lessThanFlag) {
      if (value.lt(Utils.pow10(-significant)) && value.gt(0)) {
        return '< ' + Utils.pow10(-significant).toSD(significant).toString()
      } else {
        return value.toSD(significant).toString()
      }
    } else {
      return value.toSD(significant).toString()
    }
  }

  prettyWithSymbol(decimals?: number): string {
    return this.pretty(decimals) + ' ' + this.coin?.symbol
  }
}

export function amountPretty(amount: Decimal, coinDecimal: number, decimals?: number): string {
  const significant = decimals || 6
  const value = Utils.d(amount).div(Utils.pow10(coinDecimal))
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

export function useCoin(address?: string | null): Coin | null | undefined {
  const chainId = useChainId()
  return useAppSelector((state) => {
    const coin = state.user.coins[chainId][address]
    if (address && !coin) {
      ConnectionInstance.addCoin(address, chainId)
    }
    return coin
  })
}

export function useTempCoin(address?: string | null): Coin | null | undefined {
  const chainId = useChainId()
  return useAppSelector((state) => {
    const coin = state.user.coins[chainId][address] || state.user.tempCoins[chainId][address]
    if (address && !coin) {
      ConnectionInstance.addTempCoin(address, chainId)
    }
    return coin
  })
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
