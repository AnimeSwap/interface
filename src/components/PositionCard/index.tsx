import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { amountPretty, CoinAmount, useCoin } from 'hooks/common/Coin'
import { Pair, pairKey, PairState, useNativePrice, usePair } from 'hooks/common/Pair'
import { transparentize } from 'polished'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { useChainId } from 'state/user/hooks'
import { useLpBalance } from 'state/wallets/hooks'
import styled from 'styled-components/macro'
import { formatDollarAmount } from 'utils/formatDollarAmt'

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
  nativePrice: Decimal
}

export function MinimalPositionCard({ pair, border, nativePrice }: PositionCardProps) {
  const [tvlUSD, setTvlUSD] = useState<number>(0)
  const chainId = useChainId()
  const { nativeCoin, stableCoin } = getChainInfoOrDefault(chainId)
  const coinX = useCoin(pair.coinX)
  const coinY = useCoin(pair.coinY)
  const lpBalance = Utils.d(useLpBalance(pairKey(pair.coinX, pair.coinY)))
  const poolLpPercentage = lpBalance.div(Utils.d(pair.lpTotal))
  const coinXAmount = new CoinAmount(coinX, Utils.d(pair.coinXReserve).mul(poolLpPercentage))
  const coinYAmount = new CoinAmount(coinY, Utils.d(pair.coinYReserve).mul(poolLpPercentage))
  const nativeCoinXPair = usePair(nativeCoin.address, pair.coinX)
  const nativeCoinYPair = usePair(nativeCoin.address, pair.coinY)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    let usdAmount = Utils.d(0)
    if (coinX?.address === nativeCoin.address) {
      usdAmount = coinXAmount.amount.mul(nativePrice).mul(2)
    } else if (coinY?.address === nativeCoin.address) {
      usdAmount = coinYAmount.amount.mul(nativePrice).mul(2)
    } else if (nativeCoinXPair[0] === PairState.EXISTS) {
      const pair = nativeCoinXPair[1]
      usdAmount = Utils.d(pair.coinXReserve)
        .div(Utils.d(pair.coinYReserve))
        .mul(coinXAmount.amount)
        .mul(nativePrice)
        .mul(2)
    } else if (nativeCoinYPair[0] === PairState.EXISTS) {
      const pair = nativeCoinYPair[1]
      usdAmount = Utils.d(pair.coinXReserve)
        .div(Utils.d(pair.coinYReserve))
        .mul(coinYAmount.amount)
        .mul(nativePrice)
        .mul(2)
    }
    setTvlUSD(usdAmount.div(Utils.pow10(stableCoin.decimals)).toNumber())
  }, [pair, coinX, coinY, nativePrice])

  return (
    <>
      {poolLpPercentage.toNumber() > 0 ? (
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
                {tvlUSD > 0 && <ThemedText.DeprecatedMain>~{formatDollarAmount(tvlUSD)}</ThemedText.DeprecatedMain>}
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

export default function FullPositionCard({ pair, border, nativePrice }: PositionCardProps) {
  const [tvlUSD, setTvlUSD] = useState<number>(0)
  const chainId = useChainId()
  const { nativeCoin, stableCoin } = getChainInfoOrDefault(chainId)
  const coinX = useCoin(pair.coinX)
  const coinY = useCoin(pair.coinY)
  const lpBalance = Utils.d(useLpBalance(pairKey(pair.coinX, pair.coinY)))
  const poolLpPercentage = lpBalance.div(Utils.d(pair.lpTotal))
  const coinXAmount = new CoinAmount(coinX, Utils.d(pair.coinXReserve).mul(poolLpPercentage))
  const coinYAmount = new CoinAmount(coinY, Utils.d(pair.coinYReserve).mul(poolLpPercentage))
  const nativeCoinXPair = usePair(nativeCoin.address, pair.coinX)
  const nativeCoinYPair = usePair(nativeCoin.address, pair.coinY)
  const [showMore, setShowMore] = useState(false)

  const backgroundColor = useColor(coinX)

  useEffect(() => {
    let usdAmount = Utils.d(0)
    if (coinX?.address === nativeCoin.address) {
      usdAmount = coinXAmount.amount.mul(nativePrice).mul(2)
    } else if (coinY?.address === nativeCoin.address) {
      usdAmount = coinYAmount.amount.mul(nativePrice).mul(2)
    } else if (nativeCoinXPair[0] === PairState.EXISTS) {
      const pair = nativeCoinXPair[1]
      usdAmount = Utils.d(pair.coinXReserve)
        .div(Utils.d(pair.coinYReserve))
        .mul(coinXAmount.amount)
        .mul(nativePrice)
        .mul(2)
    } else if (nativeCoinYPair[0] === PairState.EXISTS) {
      const pair = nativeCoinYPair[1]
      usdAmount = Utils.d(pair.coinXReserve)
        .div(Utils.d(pair.coinYReserve))
        .mul(coinYAmount.amount)
        .mul(nativePrice)
        .mul(2)
    }
    setTvlUSD(usdAmount.div(Utils.pow10(stableCoin.decimals)).toNumber())
  }, [pair, coinX, coinY, nativePrice])

  return (
    <StyledPositionCard
      border={border}
      bgColor={backgroundColor}
      // maxWidth={'500px'}
      // marginLeft="auto"
      // marginRight="auto"
    >
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
              padding="20px 20px"
              $borderRadius="12px"
              width="100%"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? (
                <ChevronUp size="20" style={{ marginLeft: '8px', height: '24px', minWidth: '60px' }} />
              ) : (
                <ChevronDown size="20" style={{ marginLeft: '8px', height: '24px', minWidth: '60px' }} />
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
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  {amountPretty(lpBalance, 8)}
                </Text>
                {tvlUSD > 0 && <ThemedText.DeprecatedMain>~{formatDollarAmount(tvlUSD)}</ThemedText.DeprecatedMain>}
              </RowFixed>
            </FixedHeightRow>
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
