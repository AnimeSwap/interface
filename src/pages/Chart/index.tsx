import { Trans } from '@lingui/macro'
import PoolTable from 'components/pools/PoolTable'
import { Dots } from 'components/swap/styleds'
import { useContext, useState } from 'react'
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
  const [allPoolsLoading, setAllPoolsLoading] = useState<boolean>(true)

  return (
    <ChartContainer>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="md" style={{ width: '100%' }}>
          <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
            <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
              All Pools
            </ThemedText.DeprecatedMediumHeader>
          </TitleRow>

          {allPoolsLoading ? (
            <ThemedText.DeprecatedBody color={theme.deprecated_text3} textAlign="center">
              <EmptyProposals>
                <Dots>
                  <Trans>Loading</Trans>
                </Dots>
              </EmptyProposals>
            </ThemedText.DeprecatedBody>
          ) : (
            <PoolTable poolDatas={[]} />
          )}
        </AutoColumn>
      </AutoColumn>
    </ChartContainer>
  )
}
