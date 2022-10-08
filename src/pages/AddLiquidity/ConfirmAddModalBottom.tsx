import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { Coin, CoinAmount } from 'hooks/common/Coin'
import { Text } from 'rebass'

import { ButtonPrimary } from '../../components/Button'
import CoinLogo from '../../components/CoinLogo'
import { RowBetween, RowFixed } from '../../components/Row'
import { Field } from '../../state/mint/actions'
import { ThemedText } from '../../theme'

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean
  price?: Decimal
  currencies: { [field in Field]?: Coin }
  parsedAmounts: { [field in Field]?: CoinAmount<Coin> }
  poolTokenPercentage?: Decimal
  onAdd: () => void
}) {
  return (
    <>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>{currencies[Field.CURRENCY_A]?.symbol} Deposited</Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <CoinLogo coin={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <ThemedText.DeprecatedBody>
            {parsedAmounts[Field.CURRENCY_A]?.amount.toSignificantDigits(6).toString()}
          </ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>{currencies[Field.CURRENCY_B]?.symbol} Deposited</Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <CoinLogo coin={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <ThemedText.DeprecatedBody>
            {parsedAmounts[Field.CURRENCY_B]?.amount.toSignificantDigits(6).toString()}
          </ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>Rates</Trans>
        </ThemedText.DeprecatedBody>
        <ThemedText.DeprecatedBody>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificantDigits(4).toString()} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </ThemedText.DeprecatedBody>
      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end' }}>
        <ThemedText.DeprecatedBody>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${new Decimal(1)
            .div(price)
            .toSignificantDigits(4)
            .toString()} ${currencies[Field.CURRENCY_A]?.symbol}`}
        </ThemedText.DeprecatedBody>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>Share of Pool:</Trans>
        </ThemedText.DeprecatedBody>
        <ThemedText.DeprecatedBody>
          <Trans>{noLiquidity ? '100' : poolTokenPercentage?.toSignificantDigits(4).toString()}%</Trans>
        </ThemedText.DeprecatedBody>
      </RowBetween>
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={500} fontSize={20}>
          {noLiquidity ? <Trans>Create Pool & Supply</Trans> : <Trans>Confirm Supply</Trans>}
        </Text>
      </ButtonPrimary>
    </>
  )
}
