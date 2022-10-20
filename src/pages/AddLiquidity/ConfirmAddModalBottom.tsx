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
  coins,
  parsedAmounts,
  poolCoinPercentage,
  onAdd,
}: {
  noLiquidity?: boolean
  price?: Decimal
  coins: { [field in Field]?: Coin }
  parsedAmounts: { [field in Field]?: Decimal }
  poolCoinPercentage?: Decimal
  onAdd: () => void
}) {
  const coinA_amount = new CoinAmount(coins[Field.COIN_A], parsedAmounts[Field.COIN_A])
  const coinB_amount = new CoinAmount(coins[Field.COIN_B], parsedAmounts[Field.COIN_B])

  return (
    <>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>{coins[Field.COIN_A]?.symbol} Deposited</Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <CoinLogo coin={coins[Field.COIN_A]} style={{ marginRight: '8px' }} />
          <ThemedText.DeprecatedBody>{coinA_amount.pretty()}</ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>{coins[Field.COIN_B]?.symbol} Deposited</Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <CoinLogo coin={coins[Field.COIN_B]} style={{ marginRight: '8px' }} />
          <ThemedText.DeprecatedBody>{coinB_amount.pretty()}</ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>Rates</Trans>
        </ThemedText.DeprecatedBody>
        <ThemedText.DeprecatedBody>
          {`1 ${coins[Field.COIN_A]?.symbol} = ${price?.toSD(4).toString()} ${coins[Field.COIN_B]?.symbol}`}
        </ThemedText.DeprecatedBody>
      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end' }}>
        <ThemedText.DeprecatedBody>
          {`1 ${coins[Field.COIN_B]?.symbol} = ${new Decimal(1)
            .div(price ?? 1)
            .toSD(4)
            .toString()} ${coins[Field.COIN_A]?.symbol}`}
        </ThemedText.DeprecatedBody>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>Share of Pool:</Trans>
        </ThemedText.DeprecatedBody>
        <ThemedText.DeprecatedBody>
          <Trans>{noLiquidity ? '100' : poolCoinPercentage?.toSD(4).toString()}%</Trans>
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
