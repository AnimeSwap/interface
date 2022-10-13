export class Pair {
  coinX: string
  coinY: string
  public lpTotal: string
  public coinXReserve: string
  public coinYReserve: string

  constructor(coinX: string, coinY: string) {
    this.coinX = coinX
    this.coinY = coinY
  }

  public getLPType(): string {
    return `${this.coinX}, ${this.coinY}`
  }
}
