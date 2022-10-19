import { Decimal, Utils } from '@animeswap.org/v1-sdk'

// denominated in seconds
export const MIN_DEADLINE_FROM_NOW = 10
export const DEFAULT_DEADLINE_FROM_NOW = 120
export const MAX_DEADLINE_FROM_NOW = 600

// transaction popup dismisal amounts
export const DEFAULT_TXN_DISMISS_MS = 25000

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = new Decimal(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = new Decimal(0)
export const GAS_RESERVE = new Decimal(100000)
export const REFRESH_TIMEOUT = 1000

// 1 BP = 0.01%
export const BP = Utils.BP

// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Decimal = BP.mul(100) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Decimal = BP.mul(300) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Decimal = BP.mul(500) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Decimal = BP.mul(1000) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Decimal = BP.mul(1500) // 15%

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = BP.mul(50) // 0.5%
