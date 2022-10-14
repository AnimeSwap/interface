export interface Pair {
  coinX: string
  coinY: string
  lpTotal: string
  coinXReserve: string
  coinYReserve: string
}

export function pairKey(coinXAddress: string, coinYAddress: string) {
  return `${coinXAddress}, ${coinYAddress}`
}
