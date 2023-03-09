import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
// import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import { MouseoverTooltip } from 'components/Tooltip'
import { isAptosChain, isSuiChain, isSupportedChain, SupportedChainId } from 'constants/chains'
import { BIG_INT_ZERO, BP, GAS_RESERVE, REFRESH_TIMEOUT } from 'constants/misc'
import { Coin } from 'hooks/common/Coin'
import { BestTrade, TradeState, TradeType } from 'hooks/useBestTrade'
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
  const { independentField, typedValue } = useSwapState()
  const {
    inputCoin,
    outputCoin,
    inputCoinBalance,
    outputCoinBalance,
    isExactIn,
    parsedAmount,
    inputError: swapInputError,
    trade: { bestTrade, tradeState },
    allowedSlippage,
  } = useDerivedSwapInfo()

  const parsedAmounts = useMemo(() => {
    return {
      [Field.INPUT]:
        independentField === Field.INPUT
          ? parsedAmount
          : bestTrade && inputCoin && parsedAmount && parsedAmount.gt(0)
          ? Utils.d(bestTrade?.inputAmount.amount).div(Utils.pow10(inputCoin?.decimals || 0))
          : null,
      [Field.OUTPUT]:
        independentField === Field.OUTPUT
          ? parsedAmount
          : bestTrade && outputCoin && parsedAmount && parsedAmount.gt(0)
          ? Utils.d(bestTrade?.outputAmount.amount).div(Utils.pow10(outputCoin?.decimals || 0))
          : null,
    }
  }, [independentField, parsedAmount, bestTrade])

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [TradeState.INVALID === tradeState, TradeState.LOADING === tradeState, TradeState.SYNCING === tradeState],
    [bestTrade, tradeState]
  )

  const { onSwitchCoins, onCoinSelection, onUserInput } = useSwapActionHandlers()
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
    tradeToConfirm: BestTrade | undefined
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
      [dependentField]: parsedAmounts[dependentField]?.toSD(6).toString() ?? '',
    }),
    [dependentField, independentField, parsedAmounts, typedValue]
  )
  const userHasSpecifiedInputOutput = inputCoin && outputCoin && Utils.d(parsedAmounts[independentField]).greaterThan(0)

  const swapCallback = async () => {
    try {
      let payload = {}
      if (isAptosChain(chainId)) {
        payload =
          tradeToConfirm.tradeType === TradeType.EXACT_INPUT
            ? ConnectionInstance.getSDK().route.swapExactCoinForCoinPayload({
                trade: tradeToConfirm.sdkTrade,
                slippage: BP.mul(allowedSlippage),
              })
            : ConnectionInstance.getSDK().route.swapCoinForExactCoinPayload({
                trade: tradeToConfirm.sdkTrade,
                slippage: BP.mul(allowedSlippage),
              })
      } else if (isSuiChain(chainId)) {
        payload =
          tradeToConfirm.tradeType === TradeType.EXACT_INPUT
            ? await ConnectionInstance.getSuiSDK().route.swapExactCoinForCoinPayload({
                address: account,
                trade: tradeToConfirm.sdkTrade,
                slippage: BP.mul(allowedSlippage),
              })
            : await ConnectionInstance.getSuiSDK().route.swapCoinForExactCoinPayload({
                address: account,
                trade: tradeToConfirm.sdkTrade,
                slippage: BP.mul(allowedSlippage),
              })
      }
      const txid = await SignAndSubmitTransaction(chainId, payload)
      setTimeout(() => {
        ConnectionInstance.getCoinBalance(chainId, account, tradeToConfirm.inputCoin.address)
        ConnectionInstance.getCoinBalance(chainId, account, tradeToConfirm.outputCoin.address)
        setTimeout(() => {
          ConnectionInstance.getCoinBalance(chainId, account, tradeToConfirm.inputCoin.address)
          ConnectionInstance.getCoinBalance(chainId, account, tradeToConfirm.outputCoin.address)
        }, REFRESH_TIMEOUT * 2)
      }, REFRESH_TIMEOUT)
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
  }, [swapCallback, tradeToConfirm, showConfirm, account])

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
    setSwapState({ tradeToConfirm: bestTrade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, bestTrade, txHash])

  const handleInputSelect = useCallback(
    (inputCoin: Coin) => {
      onCoinSelection(Field.INPUT, inputCoin)
      // update coin balance
      if (account && inputCoin) {
        ConnectionInstance.getCoinBalance(chainId, account, inputCoin.address)
      }
    },
    [onCoinSelection, account]
  )

  const handleMaxInput = useCallback(() => {
    const gasReserve = inputCoin.symbol === 'APT' || inputCoin.symbol === 'SUI' ? GAS_RESERVE : BIG_INT_ZERO
    inputCoinBalance &&
      onUserInput(
        Field.INPUT,
        inputCoinBalance
          .sub(gasReserve)
          .div(Utils.pow10(inputCoin?.decimals ?? 0))
          .toString()
      )
  }, [inputCoin, inputCoinBalance, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency: Coin) => {
      onCoinSelection(Field.OUTPUT, outputCurrency)
      // update coin balance
      if (account && outputCurrency) {
        ConnectionInstance.getCoinBalance(chainId, account, outputCurrency.address)
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
            trade={tradeToConfirm}
            originalTrade={bestTrade}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
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
                id={'COIN_INPUT_PANEL'}
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
                id={'COIN_OUTPUT_PANEL'}
                loading={independentField === Field.INPUT && routeIsSyncing}
              />
            </div>
            {userHasSpecifiedInputOutput && (bestTrade || routeIsLoading || routeIsSyncing) && (
              <SwapDetailsDropdown
                trade={bestTrade}
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
                      tradeToConfirm: bestTrade,
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
