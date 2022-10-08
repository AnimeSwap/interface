import { Decimal } from '@animeswap.org/v1-sdk'
import { InterfaceTrade } from 'components/swap/SwapRoute'
import { useMemo } from 'react'

const DEFAULT_AUTO_SLIPPAGE = new Decimal(10).div(10000) // 10BP
/**
 * Returns slippage tolerance based on values from current trade, gas estimates from api, and active network.
 */
export default function useAutoSlippageTolerance(trade: InterfaceTrade | undefined): Decimal {
  return useMemo(() => {
    return DEFAULT_AUTO_SLIPPAGE
  }, [trade])
}
