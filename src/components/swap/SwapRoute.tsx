import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import AnimatedDropdown from 'components/AnimatedDropdown'
import { AutoColumn } from 'components/Column'
import { LoadingRows } from 'components/Loader/styled'
import RoutingDiagram from 'components/RoutingDiagram/RoutingDiagram'
import { AutoRow, RowBetween } from 'components/Row'
import { Coin, useCoinMap } from 'hooks/common/Coin'
import { BestTrade } from 'hooks/useBestTrade'
import { memo, useState } from 'react'
import { Plus } from 'react-feather'
import { useDarkModeManager } from 'state/user/hooks'
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

interface SwapRouteProps extends React.HTMLAttributes<HTMLDivElement> {
  trade: BestTrade
  syncing: boolean
  fixedOpen?: boolean // fixed in open state, hide open/close icon
}

export default memo(function SwapRoute({ trade, syncing, fixedOpen = true, ...rest }: SwapRouteProps) {
  const [open, setOpen] = useState(true)
  // const routes = [trade.route.slice(1, -1)] // delete first and last
  const coinMap = useCoinMap()
  const [darkMode] = useDarkModeManager()
  const routes: RoutingDiagramEntry[] = [
    {
      percent: Utils.d(100),
      path: [],
      protocol: 'v1',
    },
  ]
  // TODO[Azard] not safe search coin
  try {
    routes[0].path = []
    for (let i = 0; i < trade.route.length - 1; i++) {
      routes[0].path.push([
        coinMap[trade.route[i]] || coinMap['0x1::aptos_coin::AptosCoin'],
        coinMap[trade.route[i + 1]] || coinMap['0x1::aptos_coin::AptosCoin'],
        3000, // 30bp
      ])
    }
  } catch (e) {
    console.log(e)
  }

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
          {false ? (
            <LoadingRows>
              <div style={{ width: '400px', height: '30px' }} />
            </LoadingRows>
          ) : (
            <RoutingDiagram inputCoin={trade.inputCoin} outputCoin={trade.outputCoin} routes={routes} />
          )}
          <Separator />
          {syncing ? (
            <LoadingRows>
              <div style={{ width: '250px', height: '15px' }} />
            </LoadingRows>
          ) : (
            <ThemedText.DeprecatedMain fontSize={12} width={400} margin={0}>
              {' '}
              <Trans>The Router optimizes your trade path to gain the best price.</Trans>
            </ThemedText.DeprecatedMain>
          )}
        </AutoRow>
      </AnimatedDropdown>
    </Wrapper>
  )
})

export interface RoutingDiagramEntry {
  percent: Decimal
  path: [Coin, Coin, number][]
  protocol: string
}
