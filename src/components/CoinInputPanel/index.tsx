import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import { isSupportedChain } from 'constants/chains'
import { Coin, CoinAmount } from 'hooks/common/Coin'
import { darken } from 'polished'
import { ReactNode, useCallback, useState } from 'react'
import { Lock } from 'react-feather'
import { useChainId } from 'state/user/hooks'
import { useAccount, useCoinBalance } from 'state/wallets/hooks'
import styled from 'styled-components/macro'

import { ReactComponent as DropDown } from '../../assets/dropdown.svg'
import useTheme from '../../hooks/useTheme'
import { ThemedText } from '../../theme'
import { ButtonGray } from '../Button'
import CoinLogo from '../CoinLogo'
import DoubleCoinLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween, RowFixed } from '../Row'
import CoinSearchModal from '../SearchModal/CoinSearchModal'
import { FiatValue } from './FiatValue'

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.deprecated_bg2)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
`

const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.deprecated_bg2};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

const Container = styled.div<{ hideInput: boolean; disabled: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme }) => theme.deprecated_bg0};
  background-color: ${({ theme }) => theme.deprecated_bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  ${({ theme, hideInput, disabled }) =>
    !disabled &&
    `
    :focus,
    :hover {
      border: 1px solid ${hideInput ? ' transparent' : theme.deprecated_bg3};
    }
  `}
`

const CoinSelect = styled(ButtonGray)<{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
}>`
  align-items: center;
  background-color: ${({ selected, theme }) => (selected ? theme.deprecated_bg2 : theme.deprecated_primary1)};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  color: ${({ selected, theme }) => (selected ? theme.deprecated_text1 : theme.deprecated_white)};
  cursor: pointer;
  border-radius: 16px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 500;
  height: ${({ hideInput }) => (hideInput ? '2.8rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  :focus,
  :hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.deprecated_bg3 : darken(0.05, theme.deprecated_primary1)};
  }
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 1rem 1rem')};
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.deprecated_text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.deprecated_text2)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
  height: 16px;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.deprecated_text1 : theme.deprecated_white)};
    stroke-width: 1.5px;
  }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '18px' : '18px')};
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  background-color: ${({ theme }) => theme.deprecated_primary5};
  border: none;
  border-radius: 12px;
  color: ${({ theme }) => theme.deprecated_primary1};
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  margin-left: 0.25rem;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
`

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  ${loadingOpacityMixin};
  text-align: left;
`

interface CoinInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCoinSelect?: (coin: Coin) => void
  coin?: Coin | null
  hideBalance?: boolean
  pair?: [Coin, Coin] | null
  hideInput?: boolean
  otherCurrency?: Coin | null
  fiatValue?: Decimal | null
  priceImpact?: Decimal
  id: string
  showCommonBases?: boolean
  showCoinAmount?: boolean
  disableNonToken?: boolean
  locked?: boolean
  loading?: boolean
}

export default function CoinInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCoinSelect: onCoinSelect,
  coin,
  otherCurrency,
  id,
  showCommonBases,
  showCoinAmount,
  disableNonToken,
  fiatValue,
  priceImpact,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  loading = false,
  ...rest
}: CoinInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const account = useAccount()
  const chainId = useChainId()
  const amount = useCoinBalance(coin?.address)
  const selectedCoinAmount = new CoinAmount(coin, Utils.d(amount))
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const chainAllowed = isSupportedChain(chainId)

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      {locked && (
        <FixedContainer>
          <AutoColumn gap="sm" justify="center">
            <Lock />
            <ThemedText.DeprecatedLabel fontSize="12px" textAlign="center" padding="0 12px">
              <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
            </ThemedText.DeprecatedLabel>
          </AutoColumn>
        </FixedContainer>
      )}
      <Container hideInput={hideInput} disabled={!chainAllowed}>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={!onCoinSelect}>
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={!chainAllowed}
              $loading={loading}
            />
          )}

          <CoinSelect
            disabled={!chainAllowed}
            visible={coin !== undefined}
            selected={!!coin}
            hideInput={hideInput}
            className="open-currency-select-button"
            onClick={() => {
              if (onCoinSelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              <RowFixed>
                {pair ? (
                  <span style={{ marginRight: '0.5rem' }}>
                    <DoubleCoinLogo coinX={pair[0]} coinY={pair[1]} size={24} margin={true} />
                  </span>
                ) : coin ? (
                  <CoinLogo style={{ marginRight: '0.5rem' }} coin={coin} size={'24px'} />
                ) : null}
                {pair ? (
                  <StyledTokenName className="pair-name-container">
                    {pair[0].symbol}:{pair[1].symbol}
                  </StyledTokenName>
                ) : (
                  <StyledTokenName className="token-symbol-container" active={Boolean(coin && coin.symbol)}>
                    {(coin && coin.symbol && coin.symbol.length > 20
                      ? coin.symbol.slice(0, 4) + '...' + coin.symbol.slice(coin.symbol.length - 5, coin.symbol.length)
                      : coin?.symbol) || <Trans>Select a coin</Trans>}
                  </StyledTokenName>
                )}
              </RowFixed>
              {onCoinSelect && <StyledDropDown selected={!!coin} />}
            </Aligner>
          </CoinSelect>
        </InputRow>
        {!hideInput && !hideBalance && coin && (
          <FiatRow>
            <RowBetween>
              <LoadingOpacityContainer $loading={loading}>
                <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
              </LoadingOpacityContainer>
              {account ? (
                <RowFixed style={{ height: '17px' }}>
                  <ThemedText.DeprecatedBody
                    onClick={onMax}
                    color={theme.deprecated_text3}
                    fontWeight={500}
                    fontSize={14}
                    style={{ display: 'inline', cursor: 'pointer' }}
                  >
                    {!hideBalance && coin && selectedCoinAmount ? (
                      <Trans>Balance: {selectedCoinAmount.pretty(4)}</Trans>
                    ) : null}
                  </ThemedText.DeprecatedBody>
                  {showMaxButton && selectedCoinAmount ? (
                    <StyledBalanceMax onClick={onMax}>
                      <Trans>MAX</Trans>
                    </StyledBalanceMax>
                  ) : null}
                </RowFixed>
              ) : (
                <span />
              )}
            </RowBetween>
          </FiatRow>
        )}
      </Container>
      {onCoinSelect && (
        <CoinSearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCoinSelect={onCoinSelect}
          selectedCurrency={coin}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          showCoinAmount={showCoinAmount}
          disableNonToken={disableNonToken}
        />
      )}
    </InputPanel>
  )
}
