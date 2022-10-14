import { Utils } from '@animeswap.org/v1-sdk'
import { BestTrade } from 'hooks/useBestTrade'
import { useCallback, useContext } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'

interface TradePriceProps {
  trade: BestTrade
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
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

export default function TradePrice({ trade, showInverted, setShowInverted }: TradePriceProps) {
  const theme = useContext(ThemeContext)

  const text = `1 ${trade.outputCoin?.symbol} = ${trade.price.toSD(6)} ${trade.inputCoin?.symbol}`
  const invertText = `1 ${trade.inputCoin?.symbol} = ${Utils.d(1).div(trade.price).toSD(6)} ${trade.outputCoin?.symbol}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])
  return (
    <StyledPriceContainer
      onClick={(e) => {
        e.stopPropagation() // dont want this click to affect dropdowns / hovers
        flipPrice()
      }}
      title={text}
    >
      <Text fontWeight={500} color={theme.deprecated_text1}>
        {!showInverted && text}
        {showInverted && invertText}
      </Text>
    </StyledPriceContainer>
  )
}
