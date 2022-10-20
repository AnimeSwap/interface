import { Trans } from '@lingui/macro'
import Card from 'components/Card'
import CoinLogo from 'components/CoinLogo'
import Column from 'components/Column'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { Coin } from 'hooks/common/Coin'
import { ChangeEvent, RefObject, useCallback, useMemo, useRef, useState } from 'react'
import { useChainId } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { ButtonText, ExternalLink, ExternalLinkIcon, ThemedText, TrashIcon } from 'theme'
import { isCoinAddress } from 'utils'

import useTheme from '../../hooks/useTheme'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { CoinModalView } from './CoinSearchModal'
import ImportRow from './ImportRow'
import { PaddedColumn, SearchInput, Separator } from './styleds'

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  padding-bottom: 80px;
`

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-radius: 20px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-top: 1px solid ${({ theme }) => theme.deprecated_bg3};
  padding: 20px;
  text-align: center;
`

export default function ManageTokens({
  setModalView,
  setImportToken,
}: {
  setModalView: (view: CoinModalView) => void
  setImportToken: (token: Coin) => void
}) {
  const chainId = useChainId()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const theme = useTheme()

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const checksummedInput = isCoinAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  // if they input an address, use it
  const isAddressSearch = isCoinAddress(searchQuery)
  // const searchToken = useToken(searchQuery)

  // all tokens for local lisr
  const userAddedTokens = []
  // const removeToken = useRemoveUserAddedToken()

  // const handleRemoveAll = useCallback(() => {
  //   if (chainId && userAddedTokens) {
  //     userAddedTokens.map((token) => {
  //       return removeToken(chainId, token.address)
  //     })
  //   }
  // }, [removeToken, userAddedTokens, chainId])

  const tokenList = useMemo(() => {
    return (
      chainId &&
      userAddedTokens.map((token) => (
        <RowBetween key={token.address} width="100%">
          <RowFixed>
            <CoinLogo coin={token} size={'20px'} />
            <ExternalLink href={getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS)}>
              <ThemedText.DeprecatedMain ml={'10px'} fontWeight={600}>
                {token.symbol}
              </ThemedText.DeprecatedMain>
            </ExternalLink>
          </RowFixed>
          <RowFixed>
            {/* <TrashIcon onClick={() => removeToken(chainId, token.address)} /> */}
            <ExternalLinkIcon href={getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS)} />
          </RowFixed>
        </RowBetween>
      ))
    )
  }, [userAddedTokens, chainId])

  return (
    <Wrapper>
      <Column style={{ width: '100%', height: '100%', flex: '1 1' }}>
        <PaddedColumn gap="14px">
          <Row>
            <SearchInput
              type="text"
              id="token-search-input"
              placeholder={'0x0000'}
              value={searchQuery}
              autoComplete="off"
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
            />
          </Row>
          {searchQuery !== '' && !isAddressSearch && (
            <ThemedText.DeprecatedError error={true}>
              <Trans>Enter valid token address</Trans>
            </ThemedText.DeprecatedError>
          )}
          {/* {searchToken && (
            <Card backgroundColor={theme.deprecated_bg2} padding="10px 0">
              <ImportRow
                token={searchToken}
                showImportView={() => setModalView(CoinModalView.importToken)}
                setImportToken={setImportToken}
                style={{ height: 'fit-content' }}
              />
            </Card>
          )} */}
        </PaddedColumn>
        <Separator />
        <PaddedColumn gap="lg" style={{ overflow: 'auto', marginBottom: '10px' }}>
          <RowBetween>
            <ThemedText.DeprecatedMain fontWeight={600}>
              <Trans>{userAddedTokens?.length} Custom Tokens</Trans>
            </ThemedText.DeprecatedMain>
            {/* {userAddedTokens.length > 0 && (
              <ButtonText onClick={handleRemoveAll}>
                <ThemedText.DeprecatedBlue>
                  <Trans>Clear all</Trans>
                </ThemedText.DeprecatedBlue>
              </ButtonText>
            )} */}
          </RowBetween>
          {tokenList}
        </PaddedColumn>
      </Column>
      <Footer>
        <ThemedText.DeprecatedDarkGray>
          <Trans>Tip: Custom tokens are stored locally in your browser</Trans>
        </ThemedText.DeprecatedDarkGray>
      </Footer>
    </Wrapper>
  )
}
