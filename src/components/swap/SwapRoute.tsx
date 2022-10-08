import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import AnimatedDropdown from 'components/AnimatedDropdown'
import { AutoColumn } from 'components/Column'
import { LoadingRows } from 'components/Loader/styled'
import RoutingDiagram from 'components/RoutingDiagram/RoutingDiagram'
import { AutoRow, RowBetween } from 'components/Row'
import { Coin, CoinAmount } from 'hooks/common/Coin'
import useAutoRouterSupported from 'hooks/useAutoRouterSupported'
import { TradeType } from 'hooks/useBestTrade'
import { memo, useState } from 'react'
import { Plus } from 'react-feather'
import { useChainId, useDarkModeManager } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { Separator, ThemedText } from 'theme'

import { AutoRouterLabel, AutoRouterLogo } from './RouterLabel'

const Wrapper = styled(AutoColumn)<{ darkMode?: boolean; fixedOpen?: boolean }>`
  padding: ${({ fixedOpen }) => (fixedOpen ? '12px' : '12px 8px 12px 12px')};
  border-radius: 16px;
  border: 1px solid ${({ theme, fixedOpen }) => (fixedOpen ? 'transparent' : theme.deprecated_bg2)};
  cursor: pointer;
`

const OpenCloseIcon = styled(Plus)<{ open?: boolean }>`
  margin-left: 8px;
  height: 20px;
  stroke-width: 2px;
  transition: transform 0.1s;
  transform: ${({ open }) => (open ? 'rotate(45deg)' : 'none')};
  stroke: ${({ theme }) => theme.deprecated_text3};
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`

export class InterfaceTrade {
  public readonly input: Coin
  public readonly output: Coin
  public readonly tradeType: TradeType
  public readonly inputAmount: CoinAmount<Coin>
  public readonly outputAmount: CoinAmount<Coin>
  public readonly swaps: []

  public constructor(input: Coin, output: Coin, tradeType: TradeType) {
    this.input = input
    this.output = output
    this.tradeType = tradeType
    this.outputAmount = new CoinAmount(output, new Decimal(0))
  }
}

interface SwapRouteProps extends React.HTMLAttributes<HTMLDivElement> {
  trade: InterfaceTrade
  syncing: boolean
  fixedOpen?: boolean // fixed in open state, hide open/close icon
}

export default memo(function SwapRoute({ trade, syncing, fixedOpen = false, ...rest }: SwapRouteProps) {
  const autoRouterSupported = useAutoRouterSupported()
  const routes = getTokenPath(trade)
  const [open, setOpen] = useState(false)
  const chainId = useChainId()

  const [darkMode] = useDarkModeManager()

  return (
    <Wrapper {...rest} darkMode={darkMode} fixedOpen={fixedOpen}>
      <RowBetween onClick={() => setOpen(!open)}>
        <AutoRow gap="4px" width="auto">
          <AutoRouterLogo />
          <AutoRouterLabel />
        </AutoRow>
        {fixedOpen ? null : <OpenCloseIcon open={open} />}
      </RowBetween>
      <AnimatedDropdown open={open || fixedOpen}>
        <AutoRow gap="4px" width="auto" style={{ paddingTop: '12px', margin: 0 }}>
          {syncing ? (
            <LoadingRows>
              <div style={{ width: '400px', height: '30px' }} />
            </LoadingRows>
          ) : (
            <RoutingDiagram currencyIn={trade.inputAmount.coin} currencyOut={trade.outputAmount.coin} routes={routes} />
          )}

          {autoRouterSupported && (
            <>
              <Separator />
              {syncing ? (
                <LoadingRows>
                  <div style={{ width: '250px', height: '15px' }} />
                </LoadingRows>
              ) : (
                <ThemedText.DeprecatedMain fontSize={12} width={400} margin={0}>
                  {' '}
                  <Trans>
                    This route optimizes your total output by considering split routes, multiple hops, and the gas cost
                    of each step.
                  </Trans>
                </ThemedText.DeprecatedMain>
              )}
            </>
          )}
        </AutoRow>
      </AnimatedDropdown>
    </Wrapper>
  )
})

export interface RoutingDiagramEntry {
  percent: Decimal
  path: [Coin, Coin, number][]
  // protocol: Protocol
  protocol: string
}

const V2_DEFAULT_FEE_TIER = 3000

/**
 * Loops through all routes on a trade and returns an array of diagram entries.
 */
export function getTokenPath(trade: InterfaceTrade): RoutingDiagramEntry[] {
  return trade.swaps.map(({ route: { path: tokenPath, pools, protocol }, inputAmount, outputAmount }) => {
    // const portion =
    //   trade.tradeType === TradeType.EXACT_INPUT
    //     ? inputAmount.divide(trade.inputAmount)
    //     : outputAmount.divide(trade.outputAmount)
    // const percent = new Decimal(portion.numerator).div(portion.denominator)
    const percent = new Decimal(0.5)
    const path: RoutingDiagramEntry['path'] = []
    // for (let i = 0; i < pools.length; i++) {
    //   const nextPool = pools[i]
    //   const tokenIn = tokenPath[i]
    //   const tokenOut = tokenPath[i + 1]
    //   const entry: RoutingDiagramEntry['path'][0] = [
    //     tokenIn,
    //     tokenOut,
    //     V2_DEFAULT_FEE_TIER,
    //     // nextPool instanceof Pair ? V2_DEFAULT_FEE_TIER : nextPool.fee,
    //   ]
    //   path.push(entry)
    // }
    return {
      percent,
      path,
      protocol,
    }
  })
}
