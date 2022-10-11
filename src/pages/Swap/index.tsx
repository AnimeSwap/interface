import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { sendEvent } from 'components/analytics'
// import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import { MouseoverTooltip } from 'components/Tooltip'
import { isSupportedChain } from 'constants/chains'
import { Coin } from 'hooks/common/Coin'
import { Trade, TradeState } from 'hooks/useBestTrade'
import { Context, useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, HelpCircle } from 'react-feather'
import { Text } from 'rebass'
import { useToggleWalletModal } from 'state/application/hooks'
import ConnectionInstance from 'state/connection/instance'
import { SignAndSubmitTransaction, useAccount } from 'state/wallets/hooks'
import styled, { DefaultTheme, ThemeContext } from 'styled-components/macro'

import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { GreyCard } from '../../components/Card'
import CoinInputPanel from '../../components/CoinInputPanel'
import { AutoColumn } from '../../components/Column'
import Loader from '../../components/Loader'
import { AutoRow } from '../../components/Row'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import { ArrowWrapper, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import SwapHeader from '../../components/swap/SwapHeader'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useChainId } from '../../state/user/hooks'
import { LinkStyledButton, ThemedText } from '../../theme'
import AppBody from '../AppBody'

export default function Swap() {
  const account = useAccount()
  const chainId = useChainId()
  const loadedUrlParams = useDefaultsFromURLSearch()
  const theme = useContext(ThemeContext as Context<DefaultTheme>)

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    inputCoin,
    outputCoin,
    inputCoinBalance,
    outputCoinBalance,
    isExactIn,
    parsedAmount,
    inputError: swapInputError,
    trade: { tradeState, trade },
    allowedSlippage,
  } = useDerivedSwapInfo()

  const parsedAmounts = useMemo(() => {
    return {
      [Field.INPUT]:
        independentField === Field.INPUT
          ? parsedAmount
          : Utils.d(trade?.inputAmount).div(Utils.pow10(inputCoin?.decimals || 0)),
      [Field.OUTPUT]:
        independentField === Field.OUTPUT
          ? parsedAmount
          : Utils.d(trade?.outputAmount).div(Utils.pow10(outputCoin?.decimals || 0)),
    }
  }, [independentField, parsedAmount, trade])

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [TradeState.INVALID === tradeState, TradeState.LOADING === tradeState, TradeState.SYNCING === tradeState],
    [trade, tradeState]
  )

  const { onSwitchCoins, onCoinSelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toString() ?? '',
    }),
    [dependentField, independentField, parsedAmounts, typedValue]
  )

  const userHasSpecifiedInputOutput =
    inputCoin && outputCoin && new Decimal(parsedAmounts[independentField] || 0).greaterThan(0)

  const swapCallback = async () => {
    try {
      const txid = await SignAndSubmitTransaction(tradeToConfirm.transaction)
      setTimeout(() => {
        ConnectionInstance.getCoinBalance(account, tradeToConfirm.inputCoin.address)
        ConnectionInstance.getCoinBalance(account, tradeToConfirm.outputCoin.address)
      }, 500)
      console.log('txid', txid)
      return txid
    } catch (error) {
      console.error('swapCallbackError', error)
      throw error
    }
  }

  const handleSwap = useCallback(async () => {
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    try {
      const hash = await swapCallback()
      console.log('hash', hash)
      setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
    } catch (error) {
      setSwapState({
        attemptingTxn: false,
        tradeToConfirm,
        showConfirm,
        swapErrorMessage: error.message,
        txHash: undefined,
      })
    }
  }, [swapCallback, tradeToConfirm, showConfirm, recipient, recipient, account])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const [swapQuoteReceivedDate, setSwapQuoteReceivedDate] = useState<Date | undefined>()

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  // const showApproveFlow = !swapInputError

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCoin: Coin) => {
      onCoinSelection(Field.INPUT, inputCoin)
      // update coin balance
      if (account && inputCoin) {
        ConnectionInstance.getCoinBalance(account, inputCoin.address)
      }
    },
    [onCoinSelection, account]
  )

  const handleMaxInput = useCallback(() => {
    const gasReserve = inputCoin.symbol === 'APT' ? 500 : 0
    inputCoinBalance &&
      onUserInput(Field.INPUT, ((inputCoinBalance.toNumber() - gasReserve) / 10 ** inputCoin?.decimals ?? 0).toString())
    sendEvent({
      category: 'Swap',
      action: 'Max',
    })
  }, [inputCoin, inputCoinBalance, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency: Coin) => {
      onCoinSelection(Field.OUTPUT, outputCurrency)
      // update coin balance
      if (account && outputCurrency) {
        ConnectionInstance.getCoinBalance(account, outputCurrency.address)
      }
    },
    [onCoinSelection, account]
  )

  return (
    <>
      <AppBody>
        <SwapHeader allowedSlippage={allowedSlippage} />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            swapQuoteReceivedDate={swapQuoteReceivedDate}
          />

          <AutoColumn gap={'sm'}>
            <div style={{ display: 'relative' }}>
              <CoinInputPanel
                label={<Trans>From</Trans>}
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={inputCoinBalance.gt(0)}
                coin={inputCoin ?? null}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                fiatValue={undefined}
                onCoinSelect={handleInputSelect}
                otherCurrency={outputCoin}
                showCommonBases={true}
                id={'CURRENCY_INPUT_PANEL'}
                loading={independentField === Field.OUTPUT && routeIsSyncing}
              />
              <ArrowWrapper clickable={isSupportedChain(chainId)}>
                <ArrowDown
                  size="16"
                  onClick={() => {
                    onSwitchCoins()
                  }}
                  color={inputCoin && outputCoin ? theme.deprecated_text1 : theme.deprecated_text3}
                />
              </ArrowWrapper>
              <CoinInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label={<Trans>To</Trans>}
                showMaxButton={false}
                hideBalance={false}
                fiatValue={undefined}
                coin={outputCoin ?? null}
                onCoinSelect={handleOutputSelect}
                otherCurrency={inputCoin}
                showCommonBases={true}
                id={'CURRENCY_OUTPUT_PANEL'}
                loading={independentField === Field.INPUT && routeIsSyncing}
              />
            </div>
            {userHasSpecifiedInputOutput && (trade || routeIsLoading || routeIsSyncing) && (
              <SwapDetailsDropdown
                trade={trade}
                syncing={routeIsSyncing}
                loading={routeIsLoading}
                showInverted={showInverted}
                setShowInverted={setShowInverted}
                allowedSlippage={allowedSlippage}
              />
            )}
            <div>
              {!account ? (
                <ButtonLight onClick={toggleWalletModal}>
                  <Trans>Connect Wallet</Trans>
                </ButtonLight>
              ) : routeNotFound && userHasSpecifiedInputOutput && !routeIsLoading && !routeIsSyncing ? (
                <GreyCard style={{ textAlign: 'center' }}>
                  <ThemedText.DeprecatedMain mb="4px">
                    <Trans>Insufficient liquidity for this trade.</Trans>
                  </ThemedText.DeprecatedMain>
                </GreyCard>
              ) : (
                <ButtonError
                  onClick={() => {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }}
                  id="swap-button"
                  disabled={!isValid || routeIsSyncing || routeIsLoading}
                  error={false}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {swapInputError ? swapInputError : <Trans>Swap</Trans>}
                  </Text>
                </ButtonError>
              )}
            </div>
          </AutoColumn>
        </Wrapper>
      </AppBody>
      <SwitchLocaleLink />
    </>
  )
}
