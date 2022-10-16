import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import HoverInlineText from 'components/HoverInlineText'
import { useMemo } from 'react'

import useTheme from '../../hooks/useTheme'
import { ThemedText } from '../../theme'
import { MouseoverTooltip } from '../Tooltip'

export function FiatValue({
  fiatValue,
  priceImpact,
}: {
  fiatValue: Decimal | null | undefined
  priceImpact?: Decimal
}) {
  const theme = useTheme()
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined
    if (priceImpact.lessThan('0')) return theme.deprecated_green1
    // const severity = warningSeverity(priceImpact)
    // if (severity < 1) return theme.deprecated_text3
    // if (severity < 3) return theme.deprecated_yellow1
    return theme.deprecated_red1
  }, [priceImpact, theme.deprecated_green1, theme.deprecated_red1, theme.deprecated_text3, theme.deprecated_yellow1])

  const p = Number(fiatValue?.toFixed())
  const visibleDecimalPlaces = p < 1.05 ? 4 : 2

  return (
    <ThemedText.DeprecatedBody fontSize={14} color={fiatValue ? theme.deprecated_text3 : theme.deprecated_text4}>
      {fiatValue ? (
        <Trans>
          $
          <HoverInlineText
            text={fiatValue?.toFixed(visibleDecimalPlaces)}
            textColor={fiatValue ? theme.deprecated_text3 : theme.deprecated_text4}
          />
        </Trans>
      ) : (
        ''
      )}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}>
          {' '}
          <MouseoverTooltip text={t`The estimated difference between the USD values of input and output amounts.`}>
            (<Trans>{priceImpact.mul(-1).toSD(3).toString()}%</Trans>)
          </MouseoverTooltip>
        </span>
      ) : null}
    </ThemedText.DeprecatedBody>
  )
}
