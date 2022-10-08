import { Coin } from 'hooks/common/Coin'
import styled from 'styled-components/macro'

import CoinLogo from '../CoinLogo'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-left: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCoinLogoProps {
  margin?: boolean
  size?: number
  currency0?: Coin
  currency1?: Coin
}

const HigherLogo = styled(CoinLogo)`
  z-index: 2;
`
const CoveredLogo = styled(CoinLogo)<{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCoinLogo({ currency0, currency1, size = 16, margin = false }: DoubleCoinLogoProps) {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && <HigherLogo coin={currency0} size={size.toString() + 'px'} />}
      {currency1 && <CoveredLogo coin={currency1} size={size.toString() + 'px'} sizeraw={size} />}
    </Wrapper>
  )
}
