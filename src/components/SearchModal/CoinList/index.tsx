import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { LightGreyCard } from 'components/Card'
import QuestionHelper from 'components/QuestionHelper'
import TokenSafetyIcon from 'components/TokenSafety/TokenSafetyIcon'
import { checkWarning } from 'constants/tokenSafety'
import { Phase0Variant, usePhase0Flag } from 'featureFlags/flags/phase0'
import { Coin, CoinAmount } from 'hooks/common/Coin'
import useTheme from 'hooks/useTheme'
import { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import { useAccount, useCoinAmount } from 'state/wallets/hooks'
import styled from 'styled-components/macro'

import { ThemedText } from '../../../theme'
import CoinLogo from '../../CoinLogo'
import Column, { AutoColumn } from '../../Column'
import Loader from '../../Loader'
import Row, { RowBetween, RowFixed } from '../../Row'
import { MouseoverTooltip } from '../../Tooltip'
import ImportRow from '../ImportRow'
import { LoadingRows, MenuItem } from '../styleds'

function currencyKey(currency: Coin): string {
  return currency.address
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const CurrencyName = styled(Text)`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.deprecated_bg3};
  color: ${({ theme }) => theme.deprecated_text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`
function Balance({ coinAmount }: { coinAmount: CoinAmount<Coin> }) {
  return <StyledBalanceText title={coinAmount.coin.symbol}>{coinAmount.pretty(4, true)}</StyledBalanceText>
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

function TokenTags({ currency }: { currency: Coin }) {
  const tags = []
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  showCoinAmount,
  eventProperties,
}: {
  currency: Coin
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
  showCoinAmount?: boolean
  eventProperties: Record<string, unknown>
}) {
  const key = currencyKey(currency)
  // const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = true
  const customAdded = false
  const account = useAccount()
  const coinAmount = useCoinAmount(currency.address)
  const warning = false
  const phase0Flag = usePhase0Flag()

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      tabIndex={0}
      style={style}
      className={`token-item-${key}`}
      onKeyPress={(e) => (!isSelected && e.key === 'Enter' ? onSelect() : null)}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <Column>
        <CoinLogo coin={currency} size={'24px'} />
      </Column>
      <AutoColumn>
        <Row>
          <CurrencyName title={currency.name}>{currency.name}</CurrencyName>
        </Row>
        <ThemedText.DeprecatedDarkGray ml="0px" fontSize={'12px'} fontWeight={300}>
          {currency.symbol}
        </ThemedText.DeprecatedDarkGray>
      </AutoColumn>
      <Column>
        <RowFixed style={{ justifySelf: 'flex-end' }}>
          <TokenTags currency={currency} />
        </RowFixed>
      </Column>
      {showCoinAmount && (
        <RowFixed style={{ justifySelf: 'flex-end' }}>
          {coinAmount ? <Balance coinAmount={coinAmount} /> : account ? <Loader /> : null}
        </RowFixed>
      )}
    </MenuItem>
  )
}

const BREAK_LINE = 'BREAK'
type BreakLine = typeof BREAK_LINE
function isBreakLine(x: unknown): x is BreakLine {
  return x === BREAK_LINE
}

function BreakLineComponent({ style }: { style: CSSProperties }) {
  const theme = useTheme()
  return (
    <FixedContentRow style={style}>
      <LightGreyCard padding="8px 12px" $borderRadius="8px">
        <RowBetween>
          <RowFixed>
            <ThemedText.DeprecatedMain ml="6px" fontSize="12px" color={theme.deprecated_text1}>
              <Trans>Expanded results from inactive Token Lists</Trans>
            </ThemedText.DeprecatedMain>
          </RowFixed>
          <QuestionHelper
            text={
              <Trans>
                Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.
              </Trans>
            }
          />
        </RowBetween>
      </LightGreyCard>
    </FixedContentRow>
  )
}

interface TokenRowProps {
  data: Array<Coin | BreakLine>
  index: number
  style: CSSProperties
}

const formatAnalyticsEventProperties = (
  token: Coin,
  index: number,
  data: any[],
  searchQuery: string,
  isAddressSearch: string | false
) => ({
  token_symbol: token?.symbol,
  token_address: token?.address,
  is_suggested_token: false,
  is_selected_from_list: true,
  scroll_position: '',
  token_list_index: index,
  token_list_length: data.length,
  ...(isAddressSearch === false
    ? { search_token_symbol_input: searchQuery }
    : { search_token_address_input: isAddressSearch }),
})

export default function CoinList({
  height,
  currencies,
  otherListTokens,
  selectedCurrency,
  onCoinSelect,
  otherCurrency,
  fixedListRef,
  showImportView,
  setImportToken,
  showCoinAmount,
  isLoading,
  searchQuery,
  isAddressSearch,
}: {
  height: number
  currencies: Coin[]
  otherListTokens?: Coin[]
  selectedCurrency?: Coin | null
  onCoinSelect: (currency: Coin) => void
  otherCurrency?: Coin | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showImportView: () => void
  setImportToken: (token: Coin) => void
  showCoinAmount?: boolean
  isLoading: boolean
  searchQuery: string
  isAddressSearch: string | false
}) {
  const itemData: (Coin | BreakLine)[] = useMemo(() => {
    if (otherListTokens && otherListTokens?.length > 0) {
      return [...currencies, BREAK_LINE, ...otherListTokens]
    }
    return currencies
  }, [currencies, otherListTokens])

  const Row = useCallback(
    function TokenRow({ data, index, style }: TokenRowProps) {
      const row: Coin | BreakLine = data[index]

      if (isBreakLine(row)) {
        return <BreakLineComponent style={style} />
      }

      const currency = row

      const isSelected = Boolean(currency && selectedCurrency && selectedCurrency.address === currency.address)
      const otherSelected = Boolean(currency && otherCurrency && otherCurrency.address === currency.address)
      const handleSelect = () => currency && onCoinSelect(currency)

      const token = currency

      const showImport = index > currencies.length

      if (isLoading) {
        return (
          <LoadingRows>
            <div />
            <div />
            <div />
          </LoadingRows>
        )
      } else if (showImport && token) {
        return (
          <ImportRow style={style} token={token} showImportView={showImportView} setImportToken={setImportToken} dim />
        )
      } else if (currency) {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
            showCoinAmount={showCoinAmount}
            eventProperties={formatAnalyticsEventProperties(token, index, data, searchQuery, isAddressSearch)}
          />
        )
      } else {
        return null
      }
    },
    [
      currencies.length,
      onCoinSelect,
      otherCurrency,
      selectedCurrency,
      setImportToken,
      showImportView,
      showCoinAmount,
      isLoading,
      isAddressSearch,
      searchQuery,
    ]
  )

  const itemKey = useCallback((index: number, data: typeof itemData) => {
    const currency = data[index]
    if (isBreakLine(currency)) return BREAK_LINE
    return currencyKey(currency)
  }, [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
