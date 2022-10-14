import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { Coin, Price } from 'hooks/common/Coin'
import { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { BP } from '../../constants/misc'
import { Field } from '../../state/mint/actions'
import { ThemedText } from '../../theme'

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price,
}: {
  currencies: { [field in Field]?: Coin }
  noLiquidity?: boolean
  poolTokenPercentage?: Decimal
  price?: Price<Coin, Coin>
}) {
  const theme = useContext(ThemeContext)
  return (
    <AutoColumn gap="md">
      <AutoRow justify="space-around" gap="4px">
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack>{price?.raw.toSD(6).toString() ?? '-'}</ThemedText.DeprecatedBlack>
          <Text fontWeight={500} fontSize={14} color={theme.deprecated_text2} pt={1}>
            <Trans>
              {currencies[Field.CURRENCY_B]?.symbol} per {currencies[Field.CURRENCY_A]?.symbol}
            </Trans>
          </Text>
        </AutoColumn>
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack>{price?.invert()?.toSD(6).toString() ?? '-'}</ThemedText.DeprecatedBlack>
          <Text fontWeight={500} fontSize={14} color={theme.deprecated_text2} pt={1}>
            <Trans>
              {currencies[Field.CURRENCY_A]?.symbol} per {currencies[Field.CURRENCY_B]?.symbol}
            </Trans>
          </Text>
        </AutoColumn>
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack>
            {noLiquidity && price
              ? '100'
              : (poolTokenPercentage?.lessThan(BP) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
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
