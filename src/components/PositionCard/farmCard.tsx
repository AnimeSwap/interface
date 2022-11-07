import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { amountPretty, Coin, CoinAmount, useCoin } from 'hooks/common/Coin'
import { transparentize } from 'polished'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { useLpBalance } from 'state/wallets/hooks'
import styled from 'styled-components/macro'

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

interface FarmCardProps {
  coinX?: Coin
  coinY?: Coin
  poolLP?: Decimal
  stakedLP?: Decimal
  earnedANI?: Decimal
  LPAPR?: Decimal
  stakeAPR?: Decimal
}

export default function FarmCard({ coinX, coinY }: FarmCardProps) {
  const backgroundColor = useColor()

  const isFarm = coinY ? true : false

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
                50.00%
              </Text>
            </RowFixed>
            <RowFixed>
              <ThemedText.DeprecatedMain fontSize={14}>TVL</ThemedText.DeprecatedMain>
              <Text fontSize={16} fontWeight={500} style={{ paddingLeft: '6px' }}>
                $100.00
              </Text>
            </RowFixed>
          </FixedHeightRow>
          <FixedHeightRow>
            <ThemedText.DeprecatedMain fontSize={16}>
              Available {isFarm ? 'LP' : coinX.symbol}
            </ThemedText.DeprecatedMain>
            <Column style={{ alignItems: 'flex-end' }}>
              <Text fontSize={16} fontWeight={500}>
                100.00
              </Text>
              <Text fontSize={12} fontWeight={500} style={{ paddingLeft: '6px' }}>
                {/* $100 */}
              </Text>
            </Column>
          </FixedHeightRow>
          <FixedHeightRow>
            <ThemedText.DeprecatedMain fontSize={16}>Staked {isFarm ? 'LP' : coinX.symbol}</ThemedText.DeprecatedMain>
            <Column style={{ alignItems: 'flex-end' }}>
              <Text fontSize={16} fontWeight={500}>
                100.00
              </Text>
              <Text fontSize={10} fontWeight={500} style={{ paddingLeft: '6px' }}>
                $10.00
              </Text>
            </Column>
          </FixedHeightRow>
          <FixedHeightRow>
            <ThemedText.DeprecatedMain fontSize={16}>Earned ANI</ThemedText.DeprecatedMain>
            <Column style={{ alignItems: 'flex-end' }}>
              <Text fontSize={16} fontWeight={500}>
                100.00
              </Text>
              <Text fontSize={10} fontWeight={500} style={{ paddingLeft: '6px' }}>
                $10.00
              </Text>
            </Column>
          </FixedHeightRow>
          <RowBetween marginTop="10px">
            <ButtonPrimary
              padding="8px"
              $borderRadius="8px"
              as={Link}
              to={''}
              // to={`/add/${pair.coinX}/${pair.coinY}`}
              // width="47%"
            >
              Stake
            </ButtonPrimary>
            <ButtonPrimary
              padding="8px"
              margin="0 0 0 16px"
              $borderRadius="8px"
              onClick={() => {}}
              // to={`/remove/${pair.coinX}/${pair.coinY}`}
            >
              Unstake
            </ButtonPrimary>
          </RowBetween>
          <RowBetween marginTop="0px">
            <ButtonSecondary
              padding="8px"
              $borderRadius="8px"
              as={Link}
              to={isFarm ? `/add/${coinX?.address}/${coinY?.address}` : '/swap'}
            >
              Get {isFarm ? 'LP' : 'ANI'}
            </ButtonSecondary>
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
          </RowBetween>
        </AutoColumn>
      </AutoColumn>
    </StyledPositionCard>
  )
}
