import { Trans } from '@lingui/macro'
import { BP } from 'constants/misc'
import { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import { useAccount } from 'state/wallets/hooks'
import { ThemeContext } from 'styled-components/macro'

import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { BlueCard, LightCard } from '../../components/Card'
import CoinInputPanel from '../../components/CoinInputPanel'
import CoinLogo from '../../components/CoinLogo'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import DoubleCoinLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row, { RowBetween, RowFixed } from '../../components/Row'
import Slider from '../../components/Slider'
import { Dots } from '../../components/swap/styleds'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import useDebouncedChangeHandler from '../../hooks/useDebouncedChangeHandler'
import { useToggleWalletModal } from '../../state/application/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { useChainId, useUserSlippageToleranceWithDefault } from '../../state/user/hooks'
import { StyledInternalLink, ThemedText } from '../../theme'
import AppBody from '../AppBody'
import { ClickableText, MaxButton, Wrapper } from '../Pool/styleds'

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = 50

export default function RemoveLiquidity() {
  const navigate = useNavigate()
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>()
  // const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const [currencyA, currencyB] = [undefined, undefined]
  const account = useAccount()
  const chainId = useChainId()
  const [tokenA, tokenB] = useMemo(() => [currencyA?.wrapped, currencyB?.wrapped], [currencyA, currencyB])

  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // burn state
  // const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const onUserInput = null

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE)

  // wrapped onUserInput to clear signatures
  // const onUserInput = useCallback(
  //   (field: Field, typedValue: string) => {
  //     return _onUserInput(field, typedValue)
  //   },
  //   [_onUserInput]
  // )

  // const onLiquidityInput = useCallback(
  //   (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
  //   [onUserInput]
  // )
  // const onCurrencyAInput = useCallback(
  //   (typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue),
  //   [onUserInput]
  // )
  // const onCurrencyBInput = useCallback(
  //   (typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue),
  //   [onUserInput]
  // )

  // tx sending
  const addTransaction = useTransactionAdder()

  async function onRemove() {
    if (!chainId || !account) throw new Error('missing dependencies')
    // const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    // if (!currencyAmountA || !currencyAmountB) {
    //   throw new Error('missing currency amounts')
    // }

    // const amountsMin = {
    //   [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
    //   [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    // }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    // const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    // if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB.isNative
    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[], args: Array<string | string[] | number | boolean>
  }

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <RowBetween align="flex-end">
          <Text fontSize={24} fontWeight={500}>
            {0}
          </Text>
          <RowFixed gap="4px">
            <CoinLogo coin={currencyA} size={'24px'} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {currencyA?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <Plus size="16" color={theme.deprecated_text2} />
        </RowFixed>
        <RowBetween align="flex-end">
          <Text fontSize={24} fontWeight={500}>
            {0}
          </Text>
          <RowFixed gap="4px">
            <CoinLogo coin={currencyB} size={'24px'} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {currencyB?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>

        <ThemedText.DeprecatedItalic
          fontSize={12}
          color={theme.deprecated_text2}
          textAlign="left"
          padding={'12px 0 0 0'}
        >
          <Trans>
            Output is estimated. If the price changes by more than{' '}
            {BP.mul(allowedSlippage).toSignificantDigits(4).toString()}% your transaction will revert.
          </Trans>
        </ThemedText.DeprecatedItalic>
      </AutoColumn>
    )
  }

  function modalBottom() {
    return (
      <>
        <RowBetween>
          <Text color={theme.deprecated_text2} fontWeight={500} fontSize={16}>
            <Trans>
              UNI {currencyA?.symbol}/{currencyB?.symbol} Burned
            </Trans>
          </Text>
          <RowFixed>
            <DoubleCoinLogo currency0={currencyA} currency1={currencyB} margin={true} />
            <Text fontWeight={500} fontSize={16}>
              {0}
            </Text>
          </RowFixed>
        </RowBetween>
        {/* {pair && ( */}
        <>
          <RowBetween>
            <Text color={theme.deprecated_text2} fontWeight={500} fontSize={16}>
              <Trans>Price</Trans>
            </Text>
            <Text fontWeight={500} fontSize={16} color={theme.deprecated_text1}>
              1 APT
            </Text>
          </RowBetween>
          <RowBetween>
            <div />
            <Text fontWeight={500} fontSize={16} color={theme.deprecated_text1}>
              1 APT
            </Text>
          </RowBetween>
        </>
        {/* )} */}
        <ButtonPrimary disabled={false} onClick={onRemove}>
          <Text fontWeight={500} fontSize={20}>
            <Trans>Confirm</Trans>
          </Text>
        </ButtonPrimary>
      </>
    )
  }

  const pendingText = (
    <Trans>
      Removing {0} {'APT'} and
      {0} {'APT'}
    </Trans>
  )

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput('LIQUIDITY_PERCENT', value.toString())
    },
    [onUserInput]
  )

  // const handleSelectCurrencyA = useCallback(
  //   (currency: Currency) => {
  //     if (currencyIdB && currencyId(currency) === currencyIdB) {
  //       navigate(`/remove/v2/${currencyId(currency)}/${currencyIdA}`)
  //     } else {
  //       navigate(`/remove/v2/${currencyId(currency)}/${currencyIdB}`)
  //     }
  //   },
  //   [currencyIdA, currencyIdB, navigate]
  // )
  // const handleSelectCurrencyB = useCallback(
  //   (currency: Currency) => {
  //     if (currencyIdA && currencyId(currency) === currencyIdA) {
  //       navigate(`/remove/v2/${currencyIdB}/${currencyId(currency)}`)
  //     } else {
  //       navigate(`/remove/v2/${currencyIdA}/${currencyId(currency)}`)
  //     }
  //   },
  //   [currencyIdA, currencyIdB, navigate]
  // )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput('LIQUIDITY_PERCENT', '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt('0'),
    liquidityPercentChangeCallback
  )

  return (
    <>
      <AppBody>
        <AddRemoveTabs creating={false} adding={false} defaultSlippage={DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>You will receive</Trans>}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn gap="md">
            <BlueCard>
              <AutoColumn gap="10px">
                <ThemedText.DeprecatedLink fontWeight={400} color={'deprecated_primaryText1'}>
                  <Trans>
                    <b>Tip:</b> Removing pool tokens converts your position back into underlying tokens at the current
                    rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.
                  </Trans>
                </ThemedText.DeprecatedLink>
              </AutoColumn>
            </BlueCard>
            <LightCard>
              <AutoColumn gap="20px">
                <RowBetween>
                  <Text fontWeight={500}>
                    <Trans>Remove Amount</Trans>
                  </Text>
                  <ClickableText
                    fontWeight={500}
                    onClick={() => {
                      setShowDetailed(!showDetailed)
                    }}
                  >
                    {showDetailed ? <Trans>Simple</Trans> : <Trans>Detailed</Trans>}
                  </ClickableText>
                </RowBetween>
                <Row style={{ alignItems: 'flex-end' }}>
                  <Text fontSize={72} fontWeight={500}>
                    25%
                  </Text>
                </Row>
                {!showDetailed && (
                  <>
                    <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                    <RowBetween>
                      <MaxButton onClick={() => onUserInput('LIQUIDITY_PERCENT', '25')} width="20%">
                        25%
                      </MaxButton>
                      <MaxButton onClick={() => onUserInput('LIQUIDITY_PERCENT', '50')} width="20%">
                        50%
                      </MaxButton>
                      <MaxButton onClick={() => onUserInput('LIQUIDITY_PERCENT', '75')} width="20%">
                        75%
                      </MaxButton>
                      <MaxButton onClick={() => onUserInput('LIQUIDITY_PERCENT', '100')} width="20%">
                        Max
                      </MaxButton>
                    </RowBetween>
                  </>
                )}
              </AutoColumn>
            </LightCard>
            {!showDetailed && (
              <>
                <ColumnCenter>
                  <ArrowDown size="16" color={theme.deprecated_text2} />
                </ColumnCenter>
                <LightCard>
                  <AutoColumn gap="10px">
                    <RowBetween>
                      <Text fontSize={24} fontWeight={500}>
                        APT
                      </Text>
                      <RowFixed>
                        <CoinLogo coin={currencyA} style={{ marginRight: '12px' }} />
                        <Text fontSize={24} fontWeight={500} id="remove-liquidity-tokena-symbol">
                          {currencyA?.symbol}
                        </Text>
                      </RowFixed>
                    </RowBetween>
                    <RowBetween>
                      <Text fontSize={24} fontWeight={500}>
                        APT
                      </Text>
                      <RowFixed>
                        <CoinLogo coin={currencyB} style={{ marginRight: '12px' }} />
                        <Text fontSize={24} fontWeight={500} id="remove-liquidity-tokenb-symbol">
                          {currencyB?.symbol}
                        </Text>
                      </RowFixed>
                    </RowBetween>
                  </AutoColumn>
                </LightCard>
              </>
            )}

            {showDetailed && (
              <>
                {/* <CoinInputPanel
                  value={formattedAmounts[Field.LIQUIDITY]}
                  onUserInput={onLiquidityInput}
                  onMax={() => {
                    onUserInput(Field.LIQUIDITY_PERCENT, '100')
                  }}
                  showMaxButton={!atMaxAmount}
                  currency={pair?.liquidityToken}
                  pair={pair}
                  id="liquidity-amount"
                /> */}
                <ColumnCenter>
                  <ArrowDown size="16" color={theme.deprecated_text2} />
                </ColumnCenter>
                {/* <CoinInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onCurrencyAInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyA}
                  label={'Output'}
                  onCoinSelect={handleSelectCurrencyA}
                  id="remove-liquidity-tokena"
                /> */}
                <ColumnCenter>
                  <Plus size="16" color={theme.deprecated_text2} />
                </ColumnCenter>
                {/* <CoinInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onCurrencyBInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyB}
                  label={'Output'}
                  onCoinSelect={handleSelectCurrencyB}
                  id="remove-liquidity-tokenb"
                /> */}
              </>
            )}
            {/* {pair && ( */}
            <div style={{ padding: '10px 20px' }}>
              <RowBetween>
                <Trans>Price:</Trans>
                <div>1 APT</div>
              </RowBetween>
              <RowBetween>
                <div />
                <div>1 APT</div>
              </RowBetween>
            </div>
            {/* )} */}
            <div style={{ position: 'relative' }}>
              {!account ? (
                <ButtonLight onClick={toggleWalletModal}>
                  <Trans>Connect Wallet</Trans>
                </ButtonLight>
              ) : (
                <RowBetween>
                  <ButtonConfirmed
                    onClick={() => {}}
                    confirmed={false}
                    disabled={false}
                    mr="0.5rem"
                    fontWeight={500}
                    fontSize={16}
                  >
                    <Trans>Approved</Trans>
                  </ButtonConfirmed>
                  <ButtonError
                    onClick={() => {
                      setShowConfirm(true)
                    }}
                    disabled={true}
                    error={false}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      <Trans>Remove</Trans>
                    </Text>
                  </ButtonError>
                </RowBetween>
              )}
            </div>
          </AutoColumn>
        </Wrapper>
      </AppBody>

      {/* <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
        <MinimalPositionCard showUnwrapped={false} pair={pair} />
      </AutoColumn> */}
    </>
  )
}
