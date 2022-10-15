import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { Coin } from 'hooks/common/Coin'
import { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { BP } from '../../constants/misc'
import { Field } from '../../state/mint/actions'
import { ThemedText } from '../../theme'

export function PoolPriceBar({
  coins,
  noLiquidity,
  poolCoinPercentage,
  price,
}: {
  coins: { [field in Field]?: Coin }
  noLiquidity?: boolean
  poolCoinPercentage?: Decimal
  price?: Decimal
}) {
  const theme = useContext(ThemeContext)
  return (
    <AutoColumn gap="md">
      <AutoRow justify="space-around" gap="4px">
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack>{price?.toSD(6).toString() ?? '-'}</ThemedText.DeprecatedBlack>
          <Text fontWeight={500} fontSize={14} color={theme.deprecated_text2} pt={1}>
            <Trans>
              {coins[Field.COIN_B]?.symbol} per {coins[Field.COIN_A]?.symbol}
            </Trans>
          </Text>
        </AutoColumn>
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack>
            {price ? Utils.d(1).div(price).toSD(6).toString() : '-'}
          </ThemedText.DeprecatedBlack>
          <Text fontWeight={500} fontSize={14} color={theme.deprecated_text2} pt={1}>
            <Trans>
              {coins[Field.COIN_A]?.symbol} per {coins[Field.COIN_B]?.symbol}
            </Trans>
          </Text>
        </AutoColumn>
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack>
            {noLiquidity && price
              ? '100'
              : (poolCoinPercentage?.lessThan(BP) ? '<0.01' : poolCoinPercentage?.toFixed(2)) ?? '0'}
            %
          </ThemedText.DeprecatedBlack>
          <Text fontWeight={500} fontSize={14} color={theme.deprecated_text2} pt={1}>
            <Trans>Share of Pool</Trans>
          </Text>
        </AutoColumn>
      </AutoRow>
    </AutoColumn>
  )
}
