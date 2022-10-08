import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { Trade } from 'hooks/useBestTrade'
import { useContext } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import { ThemedText } from 'theme'

interface TradePriceProps {
  trade: Trade
}

const StyledPriceContainer = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
  display: flex;
  flex-direction: row;
  text-align: left;
  flex-wrap: wrap;
  padding: 8px 0;
  user-select: text;
`

function formatPrice(price: Decimal): string {
  return price.toSignificantDigits(8).toString()
}

export default function TradePrice({ trade }: TradePriceProps) {
  const theme = useContext(ThemeContext)
  const text = `1 ${trade.inputCoin?.symbol} = ${formatPrice(new Decimal(trade?.price ?? 0))} ${
    trade.outputCoin?.symbol
  }`
  // const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`
  // const text = `${'1 '}`

  return (
    <StyledPriceContainer title={text}>
      <Text fontWeight={500} color={theme.deprecated_text1}>
        {text}
      </Text>{' '}
    </StyledPriceContainer>
  )
}
