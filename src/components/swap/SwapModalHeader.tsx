import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { BestTrade, TradeType } from 'hooks/useBestTrade'
import { useContext, useEffect, useState } from 'react'
import { AlertTriangle, ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'

import { ThemedText } from '../../theme'
import { ButtonPrimary } from '../Button'
import { LightCard } from '../Card'
import { FiatValue } from '../CoinInputPanel/FiatValue'
import CoinLogo from '../CoinLogo'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import TradePrice from '../swap/TradePrice'
import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import { SwapShowAcceptChanges, TruncatedText } from './styleds'

const ArrowWrapper = styled.div`
  padding: 4px;
  border-radius: 12px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.deprecated_bg1};
  border: 4px solid;
  border-color: ${({ theme }) => theme.deprecated_bg0};
  z-index: 2;
`

export default function SwapModalHeader({
  trade,
  shouldLogModalCloseEvent,
  setShouldLogModalCloseEvent,
  allowedSlippage,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: BestTrade
  shouldLogModalCloseEvent: boolean
  setShouldLogModalCloseEvent: (shouldLog: boolean) => void
  allowedSlippage: number
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useContext(ThemeContext)

  const [showInverted, setShowInverted] = useState<boolean>(false)
  const [priceUpdate, setPriceUpdate] = useState<number | undefined>()

  useEffect(() => {
    setShouldLogModalCloseEvent(false)
  }, [shouldLogModalCloseEvent, showAcceptChanges, setShouldLogModalCloseEvent, trade, priceUpdate])

  return (
    <AutoColumn gap={'4px'} style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap={'8px'}>
          <RowBetween align="center">
            <RowFixed gap={'0px'}>
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                // color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.deprecated_primary1 : ''}
                color={showAcceptChanges && theme.deprecated_primary1}
              >
                {trade.inputAmount.pretty(6)}{' '}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CoinLogo coin={trade.inputCoin} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.inputCoin.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          {/* <RowBetween>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween> */}
        </AutoColumn>
      </LightCard>
      <ArrowWrapper>
        <ArrowDown size="16" color={theme.deprecated_text2} />
      </ArrowWrapper>
      <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap={'8px'}>
          <RowBetween align="flex-end">
            <RowFixed gap={'0px'}>
              <TruncatedText fontSize={24} fontWeight={500}>
                {trade.outputAmount.pretty(6)}{' '}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CoinLogo coin={trade.outputCoin} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.outputCoin.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          {/* <RowBetween>
            <ThemedText.DeprecatedBody fontSize={14} color={theme.deprecated_text3}>
              <FiatValue
                fiatValue={fiatValueOutput}
                priceImpact={computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)}
              />
            </ThemedText.DeprecatedBody>
          </RowBetween> */}
        </AutoColumn>
      </LightCard>
      <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice trade={trade} showInverted={showInverted} setShowInverted={setShowInverted} />
      </RowBetween>
      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </LightCard>
      {/* {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <ThemedText.DeprecatedMain color={theme.deprecated_primary1}>
                <Trans>Price Updated</Trans>
              </ThemedText.DeprecatedMain>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              <Trans>Accept</Trans>
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null} */}
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            Output is estimated. You will receive at least <b>{trade.miniumAmountOut.prettyWithSymbol(6)}</b> or the
            transaction will revert.
          </ThemedText.DeprecatedItalic>
        ) : (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            Input is estimated. You will sell at most <b>{trade.maximumAmountIn.prettyWithSymbol(6)}</b> or the
            transaction will revert.
          </ThemedText.DeprecatedItalic>
        )}
      </AutoColumn>
    </AutoColumn>
  )
}
