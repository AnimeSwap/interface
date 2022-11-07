import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { amountPretty, Coin, CoinAmount, useCoin } from 'hooks/common/Coin'
import { pairKey, PairState, usePair } from 'hooks/common/Pair'
import { transparentize } from 'polished'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useChainId } from 'state/user/hooks'
import { useCoinAmount, useCoinBalance, useLpBalance } from 'state/wallets/hooks'
import styled from 'styled-components/macro'
import { formatDollarAmount } from 'utils/formatDollarAmt'

import { useColor } from '../../hooks/useColor'
import { ThemedText } from '../../theme'
import { ButtonGreen, ButtonPrimary, ButtonSecondary } from '../Button'
import { GreyCard, LightCard } from '../Card'
import CoinLogo from '../CoinLogo'
import Column, { AutoColumn } from '../Column'
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

export interface FarmCardProps {
  coinX?: Coin
  coinY?: Coin
  poolLP?: Decimal
  poolCoinXAmount?: Decimal
  poolCoinYAmount?: Decimal
  stakedLP?: Decimal
  earnedANI?: Decimal
  LPAPR?: Decimal
  stakeAPR?: Decimal
  nativePrice?: Decimal
}

export default function FarmCard(farmCardProps: FarmCardProps) {
  const { coinX, coinY, poolLP, poolCoinXAmount, poolCoinYAmount, stakedLP, earnedANI, LPAPR, stakeAPR, nativePrice } =
    farmCardProps
  const [tvlUSD, setTvlUSD] = useState<number>(0)
  const [availableUSD, setAvailableUSD] = useState<number>(0)
  const [stakedUSD, setStakedUSD] = useState<number>(0)
  const [earnedUSD, setEarnedUSD] = useState<number>(0)

  const openStakeModal = useToggleModal(ApplicationModal.STAKE)
  const chainId = useChainId()
  const { nativeCoin, stableCoin } = getChainInfoOrDefault(chainId)
  const backgroundColor = useColor()
  const isFarm = coinY ? true : false
  const aniBalance = useCoinAmount(coinX?.address)
  const lpBalanceString = useLpBalance(pairKey(coinX?.address, coinY?.address))
  const lpBalance = Utils.d(lpBalanceString)
  const nativeCoinXPair = usePair(nativeCoin.address, coinX?.address)
  const nativeCoinYPair = usePair(nativeCoin.address, coinY?.address)

  useEffect(() => {
    let usdAmount = Utils.d(0)
    if (coinX?.address === nativeCoin.address) {
      usdAmount = Utils.d(poolCoinXAmount).mul(nativePrice).mul(2)
    } else if (coinY?.address === nativeCoin.address) {
      usdAmount = Utils.d(poolCoinYAmount).mul(nativePrice).mul(2)
    } else if (nativeCoinXPair[0] === PairState.EXISTS) {
      const pair = nativeCoinXPair[1]
      usdAmount = Utils.d(pair.coinXReserve)
        .div(Utils.d(pair.coinYReserve))
        .mul(Utils.d(poolCoinXAmount))
        .mul(nativePrice)
        .mul(2)
    } else if (nativeCoinYPair[0] === PairState.EXISTS) {
      const pair = nativeCoinYPair[1]
      usdAmount = Utils.d(pair.coinXReserve)
        .div(Utils.d(pair.coinYReserve))
        .mul(Utils.d(poolCoinYAmount))
        .mul(nativePrice)
        .mul(2)
    }
    const usdNumber = usdAmount.div(Utils.pow10(stableCoin.decimals)).toNumber()
    setTvlUSD(usdNumber)
    if (isFarm) {
      setAvailableUSD(Utils.d(lpBalance).div(Utils.d(poolLP)).mul(usdNumber).toNumber())
    } else {
      setAvailableUSD(Utils.d(aniBalance.amount).div(Utils.d(poolLP)).mul(usdNumber).toNumber())
    }
    setStakedUSD(Utils.d(stakedLP).div(Utils.d(poolLP)).mul(usdNumber).toNumber())
    setEarnedUSD(Utils.d(earnedANI).div(Utils.d(poolLP)).mul(usdNumber).toNumber())
  }, [coinX, coinY, poolCoinXAmount, poolCoinYAmount, poolLP, stakedLP, earnedANI, nativePrice])

  return (
    <StyledPositionCard bgColor={backgroundColor} maxWidth={'340px'} width={'100%'}>
      {/* <CardNoise /> */}
      <AutoColumn gap="12px">
        <FixedHeightRow style={{ marginBottom: '8px' }}>
          {isFarm ? (
            <AutoRow gap="8px" style={{ marginLeft: '4px' }}>
              <DoubleCoinLogo coinX={coinX} coinY={coinY} size={30} margin={false} />
              <Text fontWeight={500} fontSize={20}>
                {`${coinX?.symbol}-${coinY?.symbol}`}
              </Text>
            </AutoRow>
          ) : (
            <AutoRow gap="8px" style={{ marginLeft: '0px' }}>
              <CoinLogo coin={coinX} size={'30px'} />
              <Text fontWeight={500} fontSize={20}>
                Stake {coinX?.symbol}
              </Text>
            </AutoRow>
          )}
        </FixedHeightRow>

        <AutoColumn gap="16px">
          <FixedHeightRow>
            <RowFixed>
              <ThemedText.DeprecatedMain fontSize={14}>APR</ThemedText.DeprecatedMain>
              <Text fontSize={16} fontWeight={500} style={{ paddingLeft: '6px' }}>
                {((stakeAPR?.toNumber() ?? 0) * 100).toFixed(2)}%
              </Text>
            </RowFixed>
            <RowFixed>
              <ThemedText.DeprecatedMain fontSize={14}>TVL</ThemedText.DeprecatedMain>
              <Text fontSize={16} fontWeight={500} style={{ paddingLeft: '6px' }}>
                {formatDollarAmount(tvlUSD)}
              </Text>
            </RowFixed>
          </FixedHeightRow>
          <FixedHeightRow>
            <ThemedText.DeprecatedMain fontSize={16}>
              Available {isFarm ? 'LP' : coinX.symbol}
            </ThemedText.DeprecatedMain>
            <Column style={{ alignItems: 'flex-end' }}>
              <Text fontSize={16} fontWeight={500}>
                {isFarm ? amountPretty(lpBalance, 8, 6) : aniBalance?.pretty(6)}
              </Text>
              {availableUSD > 0 && (
                <ThemedText.DeprecatedMain fontSize={10} style={{ paddingLeft: '6px' }}>
                  {formatDollarAmount(availableUSD)}
                </ThemedText.DeprecatedMain>
              )}
            </Column>
          </FixedHeightRow>
          <FixedHeightRow>
            <ThemedText.DeprecatedMain fontSize={16}>Staked {isFarm ? 'LP' : coinX.symbol}</ThemedText.DeprecatedMain>
            <Column style={{ alignItems: 'flex-end' }}>
              <Text fontSize={16} fontWeight={500}>
                {amountPretty(stakedLP, 8, 6)}
              </Text>
              {stakedUSD > 0 && (
                <ThemedText.DeprecatedMain fontSize={10} style={{ paddingLeft: '6px' }}>
                  {formatDollarAmount(stakedUSD)}
                </ThemedText.DeprecatedMain>
              )}
            </Column>
          </FixedHeightRow>
          <FixedHeightRow>
            <ThemedText.DeprecatedMain fontSize={16}>Earned ANI</ThemedText.DeprecatedMain>
            <Column style={{ alignItems: 'flex-end' }}>
              <Text fontSize={16} fontWeight={500}>
                {amountPretty(earnedANI, 8, 6)}
              </Text>
              {earnedUSD > 0 && (
                <ThemedText.DeprecatedMain fontSize={10} style={{ paddingLeft: '6px' }}>
                  {formatDollarAmount(earnedUSD)}
                </ThemedText.DeprecatedMain>
              )}
            </Column>
          </FixedHeightRow>
          <RowBetween marginTop="10px">
            <ButtonPrimary
              padding="8px"
              $borderRadius="8px"
              onClick={() => {
                window.farmCardProps = farmCardProps
                window.farmCardBalance = isFarm ? lpBalance : aniBalance.amount
                openStakeModal()
              }}
            >
              Stake
            </ButtonPrimary>
            {stakedLP?.toNumber() > 0 && (
              <ButtonPrimary
                padding="8px"
                margin="0 0 0 16px"
                $borderRadius="8px"
                onClick={() => {
                  window.farmCardProps = farmCardProps
                  window.farmCardBalance = stakedLP
                  openStakeModal()
                }}
              >
                Unstake
              </ButtonPrimary>
            )}
          </RowBetween>
          <RowBetween marginTop="0px">
            <ButtonSecondary
              padding="8px"
              $borderRadius="8px"
              as={Link}
              to={isFarm ? `/add/${coinX?.address}/${coinY?.address}` : '/'}
            >
              Get {isFarm ? 'LP' : 'ANI'}
            </ButtonSecondary>
            {stakedLP?.toNumber() > 0 && (
              <ButtonGreen
                padding="8px"
                margin="0 0 0 16px"
                $borderRadius="8px"
                onClick={() => {
                  console.log(123)
                }}
              >
                Harvest
              </ButtonGreen>
            )}
          </RowBetween>
        </AutoColumn>
      </AutoColumn>
    </StyledPositionCard>
  )
}
