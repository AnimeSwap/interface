import { Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { BP } from 'constants/misc'
import { useCoin } from 'hooks/common/Coin'
import { pairKey, usePair } from 'hooks/common/Pair'
import { ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import { useAccount, useCoinBalance, useLpBalance } from 'state/wallets/hooks'
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
import { Field } from '../../state/burn/actions'
import { useBurnActionHandlers, useBurnState } from '../../state/burn/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { useChainId, useUserSlippageTolerance } from '../../state/user/hooks'
import { StyledInternalLink, ThemedText } from '../../theme'
import AppBody from '../AppBody'
import { ClickableText, MaxButton, Wrapper } from '../Pool/styleds'

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = 50

export default function RemoveLiquidity() {
  const navigate = useNavigate()
  const { coinIdA, coinIdB } = useParams<{ coinIdA: string; coinIdB: string }>()
  const coinA = useCoin(coinIdA)
  const coinB = useCoin(coinIdB)
  const account = useAccount()
  const chainId = useChainId()
  const theme = useContext(ThemeContext)

  const lpBalance = Utils.d(useLpBalance(pairKey(coinA?.address, coinB?.address)))
  const coinABalance = useCoinBalance(coinA?.address)
  const coinBBalance = useCoinBalance(coinB?.address)

  const [pairState, pair] = usePair(coinA?.address, coinB?.address)
  const coinYdivXReserve = Utils.d(pair?.coinYReserve).div(Utils.d(pair?.coinXReserve))
  const price = coinYdivXReserve.mul(Utils.pow10(coinA.decimals - coinB.decimals))

  // const formattedAmounts = {
  //   [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
  //     ? '0'
  //     : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
  //     ? '<1'
  //     : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
  //   [Field.LIQUIDITY]:
  //     independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
  //   [Field.CURRENCY_A]:
  //     independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
  //   [Field.CURRENCY_B]:
  //     independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  // }

  // useDerivedBurnInfo
  let error: ReactNode | undefined
  if (!account) {
    error = <Trans>Connect Wallet</Trans>
  }

  // if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
  //   error = error ?? <Trans>Enter an amount</Trans>
  // }

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // burn state
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const allowedSlippage = useUserSlippageTolerance()

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return _onUserInput(field, typedValue)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback(
    (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
    [onUserInput]
  )
  const onCoinAInput = useCallback(
    (typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue),
    [onUserInput]
  )
  const onCoinBInput = useCallback(
    (typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue),
    [onUserInput]
  )

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

    if (!coinA || !coinB) throw new Error('missing coins')
    // const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    // if (!liquidityAmount) throw new Error('missing liquidity amount')

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
            <CoinLogo coin={coinA} size={'24px'} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {coinA?.symbol}
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
            <CoinLogo coin={coinB} size={'24px'} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {coinB?.symbol}
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
            Output is estimated. If the price changes by more than {BP.mul(allowedSlippage).toSD(4).toString()}% your
            transaction will revert.
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
              UNI {coinA?.symbol}/{coinB?.symbol} Burned
            </Trans>
          </Text>
          <RowFixed>
            <DoubleCoinLogo coinX={coinA} coinY={coinB} margin={true} />
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
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  // const handleSelectCoinA = useCallback(
  //   (currency: Currency) => {
  //     if (CoinIdB && coinId(currency) === CoinIdB) {
  //       navigate(`/remove/v2/${coinId(currency)}/${CoinIdA}`)
  //     } else {
  //       navigate(`/remove/v2/${coinId(currency)}/${CoinIdB}`)
  //     }
  //   },
  //   [CoinIdA, CoinIdB, navigate]
  // )
  // const handleSelectCoinB = useCallback(
  //   (currency: Currency) => {
  //     if (CoinIdA && coinId(currency) === CoinIdA) {
  //       navigate(`/remove/v2/${CoinIdB}/${coinId(currency)}`)
  //     } else {
  //       navigate(`/remove/v2/${CoinIdA}/${coinId(currency)}`)
  //     }
  //   },
  //   [CoinIdA, CoinIdB, navigate]
  // )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
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
                </RowBetween>
                <Row style={{ alignItems: 'flex-end' }}>
                  <Text fontSize={72} fontWeight={500}>
                    25%
                  </Text>
                </Row>
                <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                <RowBetween>
                  <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')} width="20%">
                    25%
                  </MaxButton>
                  <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')} width="20%">
                    50%
                  </MaxButton>
                  <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')} width="20%">
                    75%
                  </MaxButton>
                  <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')} width="20%">
                    Max
                  </MaxButton>
                </RowBetween>
              </AutoColumn>
            </LightCard>
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
                    <CoinLogo coin={coinA} style={{ marginRight: '12px' }} />
                    <Text fontSize={24} fontWeight={500} id="remove-liquidity-tokena-symbol">
                      {coinA?.symbol}
                    </Text>
                  </RowFixed>
                </RowBetween>
                <RowBetween>
                  <Text fontSize={24} fontWeight={500}>
                    APT
                  </Text>
                  <RowFixed>
                    <CoinLogo coin={coinB} style={{ marginRight: '12px' }} />
                    <Text fontSize={24} fontWeight={500} id="remove-liquidity-tokenb-symbol">
                      {coinB?.symbol}
                    </Text>
                  </RowFixed>
                </RowBetween>
              </AutoColumn>
            </LightCard>
            <div style={{ padding: '10px 20px' }}>
              <RowBetween>
                <Trans>Price:</Trans>
                <div>
                  1 {coinA?.symbol} = {price.toSD(6).toString()} {coinB?.symbol}
                </div>
              </RowBetween>
              <RowBetween>
                <div />
                <div>
                  1 {coinB?.symbol} = {Utils.d(1).div(price).toSD(6).toString()} {coinB?.symbol}
                </div>
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
      <SwitchLocaleLink />

      <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
        <MinimalPositionCard pair={pair} />
      </AutoColumn>
    </>
  )
}
