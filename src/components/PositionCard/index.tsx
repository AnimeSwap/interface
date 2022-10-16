import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { amountPretty, CoinAmount, useCoin } from 'hooks/common/Coin'
import { Pair, pairKey } from 'hooks/common/Pair'
import { transparentize } from 'polished'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { useLpBalance } from 'state/wallets/hooks'
import styled from 'styled-components/macro'

import { useColor } from '../../hooks/useColor'
import { ThemedText } from '../../theme'
import { ButtonEmpty, ButtonPrimary, ButtonSecondary } from '../Button'
import { GreyCard, LightCard } from '../Card'
import CoinLogo from '../CoinLogo'
import { AutoColumn } from '../Column'
import DoubleCoinLogo from '../DoubleLogo'
import { CardNoise } from '../earn/styled'
import { AutoRow, RowBetween, RowFixed } from '../Row'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: ${({ theme, bgColor }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.5, bgColor)} 0%, ${theme.deprecated_bg2} 100%) `};
  position: relative;
  overflow: hidden;
`

interface PositionCardProps {
  pair: Pair
  border?: string
  stakedBalance?: Decimal // optional balance to indicate that liquidity is deposited in mining pool
}

export function MinimalPositionCard({ pair, border }: PositionCardProps) {
  const coinX = useCoin(pair.coinX)
  const coinY = useCoin(pair.coinY)
  const lpBalance = Utils.d(useLpBalance(pairKey(pair.coinX, pair.coinY)))
  const poolLpPercentage = lpBalance.div(Utils.d(pair.lpTotal))
  const coinXAmount = new CoinAmount(coinX, Utils.d(pair.coinXReserve).mul(poolLpPercentage))
  const coinYAmount = new CoinAmount(coinY, Utils.d(pair.coinYReserve).mul(poolLpPercentage))

  const [showMore, setShowMore] = useState(false)

  // const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const userPoolBalance = new Decimal(0)
  // const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage = new Decimal(0)

  const [token0Deposited, token1Deposited] = [new Decimal(0), new Decimal(0)]

  return (
    <>
      {userPoolBalance ? (
        <GreyCard border={border}>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontWeight={500} fontSize={16}>
                  <Trans>Your position</Trans>
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <DoubleCoinLogo coinX={coinX} coinY={coinY} margin={true} size={20} />
                <Text fontWeight={500} fontSize={20}>
                  {`${coinX?.symbol}/${coinY?.symbol}`}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  {amountPretty(lpBalance, 8)}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="4px">
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Your pool share:</Trans>
                </Text>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>
                    {poolLpPercentage.mul(100).toFixed(2) === '0.00' ? '<0.01' : poolLpPercentage.mul(100).toFixed(2)} %
                  </Trans>
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  {coinX?.symbol}:
                </Text>
                {coinXAmount ? (
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                      {coinXAmount.pretty()}
                    </Text>
                    <CoinLogo size="20px" style={{ marginLeft: '8px' }} coin={coinX} />
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  {coinY.symbol}:
                </Text>
                {coinYAmount ? (
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                      {coinYAmount.pretty()}
                    </Text>
                    <CoinLogo size="20px" style={{ marginLeft: '8px' }} coin={coinY} />
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </GreyCard>
      ) : (
        <LightCard>
          <ThemedText.DeprecatedSubHeader style={{ textAlign: 'center' }}>
            <span role="img" aria-label="wizard-icon">
              ⭐️
            </span>{' '}
            <Trans>
              By adding liquidity you&apos;ll earn 0.25% of all trades on this pair proportional to your share of the
              pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
            </Trans>{' '}
          </ThemedText.DeprecatedSubHeader>
        </LightCard>
      )}
    </>
  )
}

export default function FullPositionCard({ pair, border, stakedBalance }: PositionCardProps) {
  const coinX = useCoin(pair.coinX)
  const coinY = useCoin(pair.coinY)
  const lpBalance = Utils.d(useLpBalance(pairKey(pair.coinX, pair.coinY)))
  const poolLpPercentage = lpBalance.div(Utils.d(pair.lpTotal))
  const coinXAmount = new CoinAmount(coinX, Utils.d(pair.coinXReserve).mul(poolLpPercentage))
  const coinYAmount = new CoinAmount(coinY, Utils.d(pair.coinYReserve).mul(poolLpPercentage))

  const [showMore, setShowMore] = useState(false)

  const backgroundColor = useColor(coinX)

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      <CardNoise />
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow gap="8px" style={{ marginLeft: '8px' }}>
            <DoubleCoinLogo coinX={coinX} coinY={coinY} size={20} />
            <Text fontWeight={500} fontSize={20}>
              {`${coinX?.symbol}/${coinY?.symbol}`}
            </Text>
          </AutoRow>
          <RowFixed gap="8px" style={{ marginRight: '4px' }}>
            <ButtonEmpty
              color={'#FFF'}
              padding="6px 8px"
              $borderRadius="12px"
              width="100%"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? (
                <>
                  {/* <Trans>Manage</Trans> */}
                  <ChevronUp size="20" style={{ marginLeft: '8px', height: '24px', minWidth: '60px' }} />
                </>
              ) : (
                <>
                  {/* <Trans>Manage</Trans> */}
                  <ChevronDown size="20" style={{ marginLeft: '8px', height: '24px', minWidth: '60px' }} />
                </>
              )}
            </ButtonEmpty>
          </RowFixed>
        </FixedHeightRow>

        {showMore && (
          <AutoColumn gap="8px">
            <FixedHeightRow>
              <Text fontSize={16} fontWeight={500}>
                <Trans>Your total pool tokens:</Trans>
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {amountPretty(lpBalance, 8)}
              </Text>
            </FixedHeightRow>
            {stakedBalance && (
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Pool tokens in rewards pool:</Trans>
                </Text>
                <Text fontSize={16} fontWeight={500}>
                  {stakedBalance.toSD(4).toString()}
                </Text>
              </FixedHeightRow>
            )}
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Pooled {coinX?.symbol}:</Trans>
                </Text>
              </RowFixed>
              {coinXAmount ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {coinXAmount.pretty()}
                  </Text>
                  <CoinLogo size="20px" style={{ marginLeft: '8px' }} coin={coinX} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Pooled {coinY?.symbol}:</Trans>
                </Text>
              </RowFixed>
              {coinYAmount ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {coinYAmount.pretty()}
                  </Text>
                  <CoinLogo size="20px" style={{ marginLeft: '8px' }} coin={coinY} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <Text fontSize={16} fontWeight={500}>
                <Trans>Your pool share:</Trans>
              </Text>
              <Text fontSize={16} fontWeight={500}>
                <Trans>
                  {poolLpPercentage.mul(100).toFixed(2) === '0.00' ? '<0.01' : poolLpPercentage.mul(100).toFixed(2)} %
                </Trans>
              </Text>
            </FixedHeightRow>

            {/* <ButtonSecondary padding="8px" $borderRadius="8px">
              <ExternalLink
                style={{ width: '100%', textAlign: 'center' }}
                href={`https://v2.info.uniswap.org/account/${account}`}
              >
                <Trans>
                  View accrued fees and analytics<span style={{ fontSize: '11px' }}>↗</span>
                </Trans>
              </ExternalLink>
            </ButtonSecondary> */}
            <RowBetween marginTop="10px">
              <ButtonPrimary
                padding="8px"
                $borderRadius="8px"
                as={Link}
                to={`/add/${pair.coinX}/${pair.coinY}`}
                width="40%"
              >
                <Trans>Add</Trans>
              </ButtonPrimary>
              <ButtonPrimary
                padding="8px"
                $borderRadius="8px"
                as={Link}
                width="40%"
                to={`/remove/${pair.coinX}/${pair.coinY}`}
              >
                <Trans>Remove</Trans>
              </ButtonPrimary>
            </RowBetween>
          </AutoColumn>
        )}
      </AutoColumn>
    </StyledPositionCard>
  )
}
