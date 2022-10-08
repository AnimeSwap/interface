import { Coin } from './Coin'

export class Pair {
  coinX: Coin
  coinY: Coin

  constructor(coinX: Coin, coinY: Coin) {
    this.coinX = coinX
    this.coinY = coinY
  }
}
