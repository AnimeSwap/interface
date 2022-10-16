import { Trans } from '@lingui/macro'
import { useCoin } from 'hooks/common/Coin'
import styled from 'styled-components/macro'

import { BIG_INT_SECONDS_IN_WEEK } from '../../constants/misc'
import { useColor } from '../../hooks/useColor'
import { StyledInternalLink, ThemedText } from '../../theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import DoubleCoinLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { Break, CardBGImage, CardNoise } from './styled'

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: none;
`};
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${
      showBackground ? theme.deprecated_black : theme.deprecated_bg5
    } 100%) `};
  color: ${({ theme, showBackground }) =>
    showBackground ? theme.deprecated_white : theme.deprecated_text1} !important;

  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  grid-gap: 0px;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  z-index: 1;
`

export default function PoolCard({ stakingInfo }: any) {
  const coinX = useCoin()
  const coinY = useCoin()

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  // get the color of the token
  const backgroundColor = useColor(coinX)

  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <CardBGImage desaturate />
      <CardNoise />

      <TopSection>
        <DoubleCoinLogo coinX={coinX} coinY={coinY} size={24} />
        <ThemedText.DeprecatedWhite fontWeight={600} fontSize={24} style={{ marginLeft: '8px' }}>
          {coinX.symbol}-{coinY.symbol}
        </ThemedText.DeprecatedWhite>

        <StyledInternalLink to={`/uni/${coinX.address}/${coinY.address}`} style={{ width: '100%' }}>
          <ButtonPrimary padding="8px" $borderRadius="8px">
            {isStaking ? <Trans>Manage</Trans> : <Trans>Deposit</Trans>}
          </ButtonPrimary>
        </StyledInternalLink>
      </TopSection>

      <StatContainer>
        <RowBetween>
          <ThemedText.DeprecatedWhite>
            <Trans>Total deposited</Trans>
          </ThemedText.DeprecatedWhite>
        </RowBetween>
        <RowBetween>
          <ThemedText.DeprecatedWhite>
            <Trans>Pool rate</Trans>
          </ThemedText.DeprecatedWhite>
          <ThemedText.DeprecatedWhite>
            {stakingInfo ? (
              stakingInfo.active ? (
                <Trans>
                  {stakingInfo.totalRewardRate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' })}{' '}
                  UNI / week
                </Trans>
              ) : (
                <Trans>0 UNI / week</Trans>
              )
            ) : (
              '-'
            )}
          </ThemedText.DeprecatedWhite>
        </RowBetween>
      </StatContainer>

      {isStaking && (
        <>
          <Break />
          <BottomSection showBackground={true}>
            <ThemedText.DeprecatedBlack color={'deprecated_white'} fontWeight={500}>
              <span>
                <Trans>Your rate</Trans>
              </span>
            </ThemedText.DeprecatedBlack>

            <ThemedText.DeprecatedBlack style={{ textAlign: 'right' }} color={'deprecated_white'} fontWeight={500}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                ⚡
              </span>
              {stakingInfo ? (
                stakingInfo.active ? (
                  <Trans>
                    {stakingInfo.rewardRate
                      ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                      ?.toSignificant(4, { groupSeparator: ',' })}{' '}
                    UNI / week
                  </Trans>
                ) : (
                  <Trans>0 UNI / week</Trans>
                )
              ) : (
                '-'
              )}
            </ThemedText.DeprecatedBlack>
          </BottomSection>
        </>
      )}
    </Wrapper>
  )
}
