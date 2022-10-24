import { Decimal } from '@animeswap.org/v1-sdk'

import { warningSeverity } from '../../utils/prices'
import { ErrorText } from './styleds'

export const formatPriceImpact = (priceImpact: Decimal) => `${priceImpact.mul(100).toFixed(2)}%`

/**
 * Formatted version of price impact text with warning colors
 */
export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Decimal }) {
  return (
    <ErrorText fontWeight={500} fontSize={14} severity={warningSeverity(priceImpact)}>
      {priceImpact ? formatPriceImpact(priceImpact) : '-'}
    </ErrorText>
  )
}
