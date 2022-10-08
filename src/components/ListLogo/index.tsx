import React from 'react'
import styled from 'styled-components/macro'

import Logo from '../Logo'

const StyledListLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function ListLogo({
  logoURL,
  style,
  size = '24px',
  alt,
}: {
  logoURL: string
  size?: string
  style?: React.CSSProperties
  alt?: string
}) {
  return <StyledListLogo alt={alt} size={size} srcs={[logoURL]} style={style} />
}
