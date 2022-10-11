import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { BestTrade } from 'hooks/useBestTrade'
import { ReactNode } from 'react'
import { Text } from 'rebass'

import { ButtonError } from '../Button'
import { AutoRow } from '../Row'
import { SwapCallbackError } from './styleds'
// import { getTokenPath, RoutingDiagramEntry } from './SwapRoute'

export default function SwapModalFooter({
  trade,
  allowedSlippage,
  txHash,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  swapQuoteReceivedDate,
}: {
  trade: BestTrade
  txHash: string | undefined
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
  swapQuoteReceivedDate: Date | undefined
}) {
  // const isAutoSlippage = useUserSlippageTolerance() === 'auto'
  // const [clientSideRouter] = useClientSideRouter()
  // const tokenInAmountUsd = useStablecoinValue(trade.inputAmount)?.toFixed(2)
  // const tokenOutAmountUsd = useStablecoinValue(trade.outputAmount)?.toFixed(2)
  // const routes = getTokenPath(trade)

  return (
    <>
      <AutoRow>
        <ButtonError onClick={onConfirm} disabled={disabledConfirm} style={{ margin: '10px 0 0 0' }}>
          <Text fontSize={20} fontWeight={500}>
            <Trans>Confirm Swap</Trans>
          </Text>
        </ButtonError>
        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
