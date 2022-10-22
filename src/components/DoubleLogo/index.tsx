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
  sizeraw?: number
  coinX?: Coin
  coinY?: Coin
}

const HigherLogo = styled(CoinLogo)`
  z-index: 2;
`
const CoveredLogo = styled(CoinLogo)<{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCoinLogo({
  coinX,
  coinY,
  size = 16,
  sizeraw = undefined,
  margin = false,
}: DoubleCoinLogoProps) {
  if (!sizeraw) {
    sizeraw = size
  }
  return (
    <Wrapper sizeraw={sizeraw} margin={margin}>
      {coinX && <HigherLogo coin={coinX} size={size.toString() + 'px'} />}
      {coinY && <CoveredLogo coin={coinY} size={size.toString() + 'px'} sizeraw={sizeraw} />}
    </Wrapper>
  )
}
