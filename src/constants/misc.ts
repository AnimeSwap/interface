import { Decimal } from '@animeswap.org/v1-sdk'

// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 20 * 60

// transaction popup dismisal amounts
export const DEFAULT_TXN_DISMISS_MS = 25000

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = new Decimal(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = new Decimal(0)

// 1 BP = 0.01%
const BIPS_BASE = new Decimal(10000)
export const ONE_BIPS = new Decimal(1).div(BIPS_BASE)

// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Decimal = ONE_BIPS.mul(100) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Decimal = ONE_BIPS.mul(300) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Decimal = ONE_BIPS.mul(500) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Decimal = ONE_BIPS.mul(1000) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Decimal = ONE_BIPS.mul(1500) // 15%

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = ONE_BIPS.mul(50) // 0.5%

export const ZERO_PERCENT = new Decimal(0)
