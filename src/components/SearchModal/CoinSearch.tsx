// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import useDebounce from 'hooks/useDebounce'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'
import useToggle from 'hooks/useToggle'
import { ChangeEvent, KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edit } from 'react-feather'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { useAllCoinBalance } from 'state/wallets/hooks'
import styled from 'styled-components/macro'

import { Coin, useCoinList, useCoinMap } from '../../hooks/common/Coin'
import { ButtonText, CloseIcon, IconWrapper, ThemedText } from '../../theme'
import { isCoinAddress } from '../../utils'
import Column from '../Column'
import Row, { RowBetween, RowFixed } from '../Row'
import CoinList from './CoinList'
import CommonBases from './CommonBases'
import ImportRow from './ImportRow'
import { PaddedColumn, SearchInput, Separator } from './styleds'

const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
`

const Footer = styled.div`
  width: 100%;
  border-radius: 20px;
  padding: 20px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.deprecated_bg1};
  border-top: 1px solid ${({ theme }) => theme.deprecated_bg2};
`

interface CoinSearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Coin | null
  onCoinSelect: (currency: Coin) => void
  otherSelectedCurrency?: Coin | null
  showCommonBases?: boolean
  showCoinAmount?: boolean
  disableNonToken?: boolean
  showManageView: () => void
  showImportView: () => void
  setImportToken: (token: Coin) => void
}

export function useSortTokensByQuery(query: string, tokens?: Coin[]): Coin[] {
  return useMemo(() => {
    if (!tokens) {
      return []
    }

    const matches = query
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0)

    if (matches.length > 1) {
      return tokens
    }

    const exactMatches: Coin[] = []
    const symbolSubtrings: Coin[] = []
    const rest: Coin[] = []

    // sort tokens by exact match -> subtring on symbol match -> rest
    tokens.map((token) => {
      if (token.symbol?.toLowerCase() === matches[0]) {
        return exactMatches.push(token)
      } else if (token.symbol?.toLowerCase().startsWith(query.toLowerCase().trim())) {
        return symbolSubtrings.push(token)
      } else {
        return rest.push(token)
      }
    })
    return [...exactMatches, ...symbolSubtrings, ...rest]
  }, [tokens, query])
}

export function CoinSearch({
  selectedCurrency,
  onCoinSelect,
  otherSelectedCurrency,
  showCommonBases,
  showCoinAmount: showCoinAmount,
  disableNonToken,
  onDismiss,
  isOpen,
  showManageView,
  showImportView,
  setImportToken,
}: CoinSearchProps) {
  const chainId = useChainId()
  const theme = useTheme()

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const allCoins = useCoinMap()

  // if they input an address, use it
  const isAddressSearch = isCoinAddress(debouncedQuery)
  if (isAddressSearch) {
    const addressCoin = allCoins[debouncedQuery]
    if (!addressCoin) {
      // Azard: add custom coin
      ConnectionInstance.addCoin(debouncedQuery, chainId)
    }
  }

  const filteredTokens: Coin[] = useMemo(() => {
    return Object.values(allCoins).filter((coin: Coin) => {
      const searchingAddress = isCoinAddress(debouncedQuery)
      if (searchingAddress) {
        const address = searchingAddress.toLowerCase()
        return address === coin.address.toLowerCase()
      }
      const queryParts = debouncedQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((s) => s.length > 0)
      if (queryParts.length === 0) return true

      const match = (s: string): boolean => {
        const parts = s
          .toLowerCase()
          .split(/\s+/)
          .filter((s) => s.length > 0)
        return queryParts.every((p) => p.length === 0 || parts.some((sp) => sp.startsWith(p) || sp.endsWith(p)))
      }
      return match(coin.symbol) || match(coin.name)
    })
  }, [allCoins, debouncedQuery])

  const allCoinbalance = useAllCoinBalance()
  const sortedTokens: Coin[] = useMemo(
    () =>
      [...filteredTokens].sort((coinA, coinB) => {
        const balanceA = parseInt(allCoinbalance[coinA.address] ?? '0')
        const balanceB = parseInt(allCoinbalance[coinB.address] ?? '0')
        return balanceB - balanceA
      }),
    [allCoinbalance, filteredTokens]
  )

  const handleCoinSelect = useCallback(
    (currency: Coin) => {
      onCoinSelect(currency)
      onDismiss()
    },
    [onDismiss, onCoinSelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const checksummedInput = isCoinAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const filteredSortedTokens = useSortTokensByQuery(debouncedQuery, sortedTokens)

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return
      if (filteredSortedTokens.length > 0) {
        if (
          filteredSortedTokens[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
          filteredSortedTokens.length === 1
        ) {
          handleCoinSelect(filteredSortedTokens[0])
        }
      }
    },
    [debouncedQuery, filteredSortedTokens, handleCoinSelect]
  )

  // menu ui
  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, open ? toggle : undefined)

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = []

  return (
    <ContentWrapper>
      <PaddedColumn gap="16px">
        <RowBetween>
          <Text fontWeight={500} fontSize={16}>
            <Trans>Select a coin</Trans>
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <Row>
          <SearchInput
            type="text"
            id="token-search-input"
            placeholder={t`Search name or paste address`}
            autoComplete="off"
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
          />
        </Row>
        {showCommonBases && (
          <CommonBases
            chainId={chainId}
            onSelect={handleCoinSelect}
            selectedCurrency={selectedCurrency}
            searchQuery={searchQuery}
            isAddressSearch={isAddressSearch}
          />
        )}
      </PaddedColumn>
      <Separator />
      <div style={{ flex: '1' }}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <CoinList
              height={height}
              currencies={filteredSortedTokens}
              otherListTokens={filteredInactiveTokens}
              onCoinSelect={handleCoinSelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
              showImportView={showImportView}
              setImportToken={setImportToken}
              showCoinAmount={showCoinAmount}
              // isLoading={balancesIsLoading && !tokenLoaderTimerElapsed}
              isLoading={false}
              searchQuery={searchQuery}
              isAddressSearch={isAddressSearch}
            />
          )}
        </AutoSizer>
      </div>
      {/* {searchToken && !searchTokenIsAdded ? (
          <Column style={{ padding: '20px 0', height: '100%' }}>
            <ImportRow token={searchToken} showImportView={showImportView} setImportToken={setImportToken} />
          </Column>
        ) : filteredSortedTokens?.length > 0 || filteredInactiveTokens?.length > 0 ? (
          <div style={{ flex: '1' }}>
            <AutoSizer disableWidth>
              {({ height }) => (
                <CoinList
                  height={height}
                  currencies={CoinList}
                  otherListTokens={filteredInactiveTokens}
                  onCoinSelect={handleCoinSelect}
                  otherCurrency={otherSelectedCurrency}
                  selectedCurrency={selectedCurrency}
                  fixedListRef={fixedList}
                  showImportView={showImportView}
                  setImportToken={setImportToken}
                  showCoinAmount={showCoinAmount}
                  isLoading={balancesIsLoading && !tokenLoaderTimerElapsed}
                  searchQuery={searchQuery}
                  isAddressSearch={isAddressSearch}
                />
              )}
            </AutoSizer>
          </div>
        ) : (
          <Column style={{ padding: '20px', height: '100%' }}>
            <ThemedText.DeprecatedMain color={theme.deprecated_text3} textAlign="center" mb="20px">
              <Trans>No results found.</Trans>
            </ThemedText.DeprecatedMain>
          </Column>
        )} */}
      <Footer>
        <Row justify="center">
          <ButtonText onClick={showManageView} color={theme.deprecated_primary1} className="list-token-manage-button">
            <RowFixed>
              <IconWrapper size="16px" marginRight="6px" stroke={theme.deprecated_primaryText1}>
                <Edit />
              </IconWrapper>
              <ThemedText.DeprecatedMain color={theme.deprecated_primaryText1}>
                <Trans>Manage Coin Lists</Trans>
              </ThemedText.DeprecatedMain>
            </RowFixed>
          </ButtonText>
        </Row>
      </Footer>
    </ContentWrapper>
  )
}
