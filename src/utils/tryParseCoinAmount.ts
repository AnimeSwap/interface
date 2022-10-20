import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Coin } from 'hooks/common/Coin'

export function tryParseCoinAmount(value: string, coin: Coin): Decimal | undefined {
  if (!value || !coin) {
    return undefined
  }
  try {
    return Utils.d(value).mul(Utils.pow10(coin?.decimals)).floor()
  } catch (error) {
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  return undefined
}
