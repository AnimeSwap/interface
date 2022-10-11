import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { ReactComponent as StaticRouterIcon } from '../../assets/static_route.svg'
import AutoRouterIcon from './AutoRouterIcon'

const StyledAutoRouterIcon = styled(AutoRouterIcon)`
  height: 16px;
  width: 16px;

  :hover {
    filter: brightness(1.3);
  }
`

const StyledAutoRouterLabel = styled(ThemedText.DeprecatedBlack)`
  line-height: 1rem;

  /* fallback color */
  color: ${({ theme }) => theme.deprecated_green1};

  @supports (-webkit-background-clip: text) and (-webkit-text-fill-color: transparent) {
    background-image: linear-gradient(90deg, #dd73ff 0%, #f1d5ff 163.16%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`

export function AutoRouterLogo() {
  return <StyledAutoRouterIcon />
}

export function AutoRouterLabel() {
  return <StyledAutoRouterLabel fontSize={14}>Anime Router</StyledAutoRouterLabel>
}
