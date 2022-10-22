import { Trans } from '@lingui/macro'
import PoolTable, { PoolData } from 'components/pools/PoolTable'
import { Dots } from 'components/swap/styleds'
import { APTOS_CoinInfo } from 'constants/coinInfo'
import { useCoin } from 'hooks/common/Coin'
import { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from '../../components/Column'
import { RowBetween, RowFixed } from '../../components/Row'
import { ExternalLink, HideSmall, ThemedText } from '../../theme'

const ChartContainer = styled.div`
  width: 100%;
  min-width: 320px;
  max-width: 800px;
  padding: 0px 12px;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.deprecated_text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default function Explore() {
  const theme = useContext(ThemeContext)
  const [poolDatas, setPoolDatas] = useState<PoolData[]>([])

  const coin = useCoin('0x1::aptos_coin::AptosCoin')

  useEffect(() => {
    const poolData: PoolData = {
      address: '1',
      coin0: APTOS_CoinInfo['0x1::aptos_coin::AptosCoin'],
      coin1: APTOS_CoinInfo['0x1::aptos_coin::AptosCoin'],
      tvlUSD: 0,
      volumeUSD: 0,
      volumeUSDWeek: 0,
    }
    setPoolDatas([poolData])
  }, [])

  return (
    <ChartContainer>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="md" style={{ width: '100%' }}>
          <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
            <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
              All Pools
            </ThemedText.DeprecatedMediumHeader>
          </TitleRow>
          <PoolTable poolDatas={poolDatas} />
        </AutoColumn>
      </AutoColumn>
    </ChartContainer>
  )
}
