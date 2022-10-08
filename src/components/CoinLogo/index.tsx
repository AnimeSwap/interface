import { Coin } from 'hooks/common/Coin'
import React from 'react'
import styled from 'styled-components/macro'

import Logo from '../Logo'

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  // background: radial-gradient(white 50%, #ffffff00 calc(75% + 1px), #ffffff00 100%);
  border-radius: 50%;
  -mox-box-shadow: 0 0 1px black;
  -webkit-box-shadow: 0 0 1px black;
  box-shadow: 0 0 1px black;
  border: 0px solid rgba(255, 255, 255, 0);
`

export default function CoinLogo({
  coin,
  size = '24px',
  style,
  ...rest
}: {
  coin?: Coin | null
  size?: string
  style?: React.CSSProperties
}) {
  const props = {
    alt: `${coin?.symbol ?? 'coin'} logo`,
    size,
    srcs: coin?.logoURL,
    style,
    ...rest,
  }
  return <StyledLogo {...props} />
}
