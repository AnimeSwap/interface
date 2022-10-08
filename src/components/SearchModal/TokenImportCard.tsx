import { Trans } from '@lingui/macro'
import Card from 'components/Card'
import CoinLogo from 'components/CoinLogo'
import { AutoColumn } from 'components/Column'
import ListLogo from 'components/ListLogo'
import { RowFixed } from 'components/Row'
import { Coin, ImportCoinList } from 'hooks/common/Coin'
import { transparentize } from 'polished'
import { AlertCircle } from 'react-feather'
import { useChainId } from 'state/user/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ExternalLink, ThemedText } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const WarningWrapper = styled(Card)<{ highWarning: boolean }>`
  background-color: ${({ theme, highWarning }) =>
    highWarning ? transparentize(0.8, theme.deprecated_red1) : transparentize(0.8, theme.deprecated_yellow2)};
  width: fit-content;
`

const AddressText = styled(ThemedText.DeprecatedBlue)`
  font-size: 12px;
  word-break: break-all;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `}
`
interface TokenImportCardProps {
  list?: ImportCoinList
  token: Coin
}
const TokenImportCard = ({ list, token }: TokenImportCardProps) => {
  const theme = useTheme()
  const chainId = useChainId()
  return (
    <Card backgroundColor={theme.deprecated_bg2} padding="2rem">
      <AutoColumn gap="10px" justify="center">
        <CoinLogo coin={token} size={'32px'} />
        <AutoColumn gap="4px" justify="center">
          <ThemedText.DeprecatedBody ml="8px" mr="8px" fontWeight={500} fontSize={20}>
            {token.symbol}
          </ThemedText.DeprecatedBody>
          <ThemedText.DeprecatedDarkGray fontWeight={400} fontSize={14}>
            {token.name}
          </ThemedText.DeprecatedDarkGray>
        </AutoColumn>
        {chainId && (
          <ExternalLink href={getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS)}>
            <AddressText fontSize={12}>{token.address}</AddressText>
          </ExternalLink>
        )}
        {list !== undefined ? (
          <RowFixed>
            {list.logoURL && <ListLogo logoURL={list.logoURL} size="16px" />}
            <ThemedText.DeprecatedSmall ml="6px" fontSize={14} color={theme.deprecated_text3}>
              <Trans>via {list.name} token list</Trans>
            </ThemedText.DeprecatedSmall>
          </RowFixed>
        ) : (
          <WarningWrapper $borderRadius="4px" padding="4px" highWarning={true}>
            <RowFixed>
              <AlertCircle stroke={theme.deprecated_red1} size="10px" />
              <ThemedText.DeprecatedBody color={theme.deprecated_red1} ml="4px" fontSize="10px" fontWeight={500}>
                <Trans>Unknown Source</Trans>
              </ThemedText.DeprecatedBody>
            </RowFixed>
          </WarningWrapper>
        )}
      </AutoColumn>
    </Card>
  )
}

export default TokenImportCard
