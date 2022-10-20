import CoinLogo from 'components/CoinLogo'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'
import { COIN_BASES } from 'constants/coinbases'
import { Coin } from 'hooks/common/Coin'
import { useTokenInfoFromActiveList } from 'hooks/useTokenInfoFromActiveList'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

const MobileWrapper = styled(AutoColumn)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const BaseWrapper = styled.div<{ disable?: boolean }>`
  border: 1px solid ${({ theme, disable }) => (disable ? 'transparent' : theme.deprecated_bg3)};
  border-radius: 10px;
  display: flex;
  padding: 6px;

  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ theme, disable }) => !disable && theme.deprecated_bg2};
  }

  color: ${({ theme, disable }) => disable && theme.deprecated_text3};
  background-color: ${({ theme, disable }) => disable && theme.deprecated_bg3};
  filter: ${({ disable }) => disable && 'grayscale(1)'};
`

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
  searchQuery,
  isAddressSearch,
}: {
  chainId?: number
  selectedCurrency?: Coin | null
  onSelect: (currency: Coin) => void
  searchQuery: string
  isAddressSearch: string | false
}) {
  const bases = COIN_BASES[chainId] ?? []
  return bases.length > 0 ? (
    <MobileWrapper gap="md">
      <AutoRow gap="4px">
        {bases.map((currency: Coin) => {
          const isSelected = selectedCurrency?.address === currency.address
          return (
            <BaseWrapper
              tabIndex={0}
              onKeyPress={(e) => !isSelected && e.key === 'Enter' && onSelect(currency)}
              onClick={() => !isSelected && onSelect(currency)}
              disable={isSelected}
              key={currency.address}
            >
              <CurrencyLogoFromList currency={currency} />
              <Text fontWeight={500} fontSize={16}>
                {currency.symbol}
              </Text>
            </BaseWrapper>
          )
        })}
      </AutoRow>
    </MobileWrapper>
  ) : null
}

/** helper component to retrieve a base currency from the active token lists */
function CurrencyLogoFromList({ currency }: { currency: Coin }) {
  const token = useTokenInfoFromActiveList(currency)

  return <CoinLogo coin={token} style={{ marginRight: 8 }} />
}
