import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { Coin, CoinAmount } from 'hooks/common/Coin'
import { BestTrade, TradeType } from 'hooks/useBestTrade'
import { useContext, useMemo } from 'react'
import { useChainId } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components/macro'

import { Separator, ThemedText } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip } from '../Tooltip'
import FormattedPriceImpact from './FormattedPriceImpact'

const StyledCard = styled(Card)`
  padding: 0;
`

interface AdvancedSwapDetailsProps {
  trade?: BestTrade
  allowedSlippage: number
  syncing?: boolean
  hideInfoTooltips?: boolean
}

function TextWithLoadingPlaceholder({
  syncing,
  width,
  children,
}: {
  syncing: boolean
  width: number
  children: JSX.Element
}) {
  return syncing ? (
    <LoadingRows>
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  )
}

export function AdvancedSwapDetails({
  trade,
  allowedSlippage,
  syncing = false,
  hideInfoTooltips = false,
}: AdvancedSwapDetailsProps) {
  const theme = useContext(ThemeContext)
  // const chainId = useChainId()

  const { expectedOutputAmount, priceImpact } = useMemo(() => {
    return {
      expectedOutputAmount: trade?.outputAmount,
      priceImpact: trade.priceImpact,
    }
  }, [trade])

  return !trade ? null : (
    <StyledCard>
      <AutoColumn gap="8px">
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={
                <Trans>
                  The amount you expect to receive at the current market price. You may receive less or more if the
                  market price changes while your transaction is pending.
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text1}>
                <Trans>Expected Output</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={65}>
            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
              {expectedOutputAmount ? expectedOutputAmount.prettyWithSymbol(6) : '-'}
            </ThemedText.DeprecatedBlack>
          </TextWithLoadingPlaceholder>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={<Trans>The impact your trade has on the market price of this pool.</Trans>}
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text1}>
                <Trans>Price Impact</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={50}>
            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
              <FormattedPriceImpact priceImpact={priceImpact} />
            </ThemedText.DeprecatedBlack>
          </TextWithLoadingPlaceholder>
        </RowBetween>
        <Separator />
        <RowBetween>
          <RowFixed style={{ marginRight: '20px' }}>
            <MouseoverTooltip
              text={
                <Trans>
                  The minimum amount you are guaranteed to receive. If the price slips any further, your transaction
                  will revert.
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text3}>
                {trade.tradeType === TradeType.EXACT_INPUT ? (
                  <Trans>Minimum received</Trans>
                ) : (
                  <Trans>Maximum sent</Trans>
                )}{' '}
                <Trans>after slippage</Trans> ({Utils.d(allowedSlippage).div(100).toFixed(2)}%)
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={70}>
            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.deprecated_text3}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? `${trade.miniumAmountOut.prettyWithSymbol(6)}`
                : `${trade.maximumAmountIn.prettyWithSymbol(6)}`}
            </ThemedText.DeprecatedBlack>
          </TextWithLoadingPlaceholder>
        </RowBetween>
        {/* {!trade?.gasUseEstimateUSD || !chainId ? null : (
          <RowBetween>
            <MouseoverTooltip
              text={
                <Trans>
                  The fee paid to miners who process your transaction. This must be paid in {'APT'}.
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_text3}>
                <Trans>Network Fee</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
            <TextWithLoadingPlaceholder syncing={syncing} width={50}>
              <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.deprecated_text3}>
                ~${trade.gasUseEstimateUSD.toFixed(2)}
              </ThemedText.DeprecatedBlack>
            </TextWithLoadingPlaceholder>
          </RowBetween>
        )} */}
      </AutoColumn>
    </StyledCard>
  )
}
