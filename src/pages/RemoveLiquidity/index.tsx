import { Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { useWalletKit } from '@mysten/wallet-kit'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { isSuiChain, SupportedChainId } from 'constants/chains'
import { BIG_INT_ZERO, BP, REFRESH_TIMEOUT } from 'constants/misc'
import { amountPretty, CoinAmount, useCoin } from 'hooks/common/Coin'
import { pairKey, useNativePrice, usePair } from 'hooks/common/Pair'
import { ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import ConnectionInstance from 'state/connection/instance'
import { SignAndSubmitSuiTransaction, SignAndSubmitTransaction, useAccount, useLpBalance } from 'state/wallets/hooks'
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
import { useChainId, useUserSlippageTolerance } from '../../state/user/hooks'
import { StyledInternalLink, ThemedText } from '../../theme'
import AppBody from '../AppBody'
import { ClickableText, MaxButton, Wrapper } from '../Pool/styleds'

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = 50

export enum Field {
  LIQUIDITY_PERCENT = 'LIQUIDITY_PERCENT',
  LIQUIDITY = 'LIQUIDITY',
  COIN_A = 'COIN_A',
  COIN_B = 'COIN_B',
}

export default function RemoveLiquidity() {
  const { coinIdA, coinIdB } = useParams<{ coinIdA: string; coinIdB: string }>()
  const chainId = useChainId()
  const { signAndExecuteTransactionBlock } = useWalletKit()
  const coinA = useCoin(coinIdA)
  const coinB = useCoin(coinIdB)
  const account = useAccount()
  const theme = useContext(ThemeContext)

  const [pairState, pair] = usePair(coinA?.address, coinB?.address)
  const lpBalance = Utils.d(useLpBalance(pairKey(coinA?.address, coinB?.address)))
  const lpPercentage = lpBalance.div(pair?.lpTotal)
  const coinAReserve = Utils.d(pair?.coinXReserve).mul(lpPercentage).floor()
  const coinBReserve = Utils.d(pair?.coinYReserve).mul(lpPercentage).floor()
  const coinYdivXReserve = Utils.d(pair?.coinYReserve).div(Utils.d(pair?.coinXReserve))
  const price = coinYdivXReserve.mul(Utils.pow10((coinA?.decimals ?? 0) - (coinB?.decimals ?? 0)))
  const nativePrice = useNativePrice()

  // useDerivedBurnInfo
  const [parsedAmounts, setParsedAmounts] = useState({
    [Field.LIQUIDITY_PERCENT]: '0',
    [Field.LIQUIDITY]: BIG_INT_ZERO,
    [Field.COIN_A]: BIG_INT_ZERO,
    [Field.COIN_B]: BIG_INT_ZERO,
  })

  const coinA_amount =
    coinA && parsedAmounts[Field.COIN_A] ? new CoinAmount(coinA, parsedAmounts[Field.COIN_A]) : undefined
  const coinB_amount =
    coinB && parsedAmounts[Field.COIN_B] ? new CoinAmount(coinB, parsedAmounts[Field.COIN_B]) : undefined

  let error: ReactNode | undefined
  if (!account) {
    error = <Trans>Connect Wallet</Trans>
  }

  if (
    parsedAmounts[Field.LIQUIDITY].lte(BIG_INT_ZERO) ||
    parsedAmounts[Field.COIN_A].lte(BIG_INT_ZERO) ||
    parsedAmounts[Field.COIN_B].lte(BIG_INT_ZERO)
  ) {
    error = error ?? <Trans>Enter an amount</Trans>
  }

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // burn state
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const allowedSlippage = useUserSlippageTolerance()

  async function onRemove() {
    if (isSuiChain(chainId)) {
      return onSuiRemove()
    }
    try {
      const payload = ConnectionInstance.getSDK().swap.removeLiquidityPayload({
        coinX: coinA.address,
        coinY: coinB.address,
        amount: parsedAmounts[Field.LIQUIDITY],
        amountXDesired: parsedAmounts[Field.COIN_A],
        amountYDesired: parsedAmounts[Field.COIN_B],
        slippage: BP.mul(allowedSlippage),
      })
      setAttemptingTxn(true)
      const txid = await SignAndSubmitTransaction(chainId, payload)
      setAttemptingTxn(false)
      setTxHash(txid)
      setTimeout(() => {
        ConnectionInstance.syncAccountResources(account, chainId, true)
        setTimeout(() => {
          ConnectionInstance.syncAccountResources(account, chainId, true)
        }, REFRESH_TIMEOUT * 2)
      }, REFRESH_TIMEOUT)
    } catch (error) {
      setAttemptingTxn(false)
      console.error('onRemove', error)
      throw error
    }
  }

  async function onSuiRemove() {
    try {
      setAttemptingTxn(true)
      const payload = await ConnectionInstance.getSuiSDK().swap.removeLiquidityPayload({
        address: account,
        coinX: coinA.address,
        coinY: coinB.address,
        amount: parsedAmounts[Field.LIQUIDITY],
        amountXDesired: parsedAmounts[Field.COIN_A],
        amountYDesired: parsedAmounts[Field.COIN_B],
        slippage: BP.mul(allowedSlippage),
      })
      const txid = await SignAndSubmitSuiTransaction(chainId, payload, signAndExecuteTransactionBlock)
      setAttemptingTxn(false)
      setTxHash(txid)
      setTimeout(() => {
        ConnectionInstance.syncSuiAccountResources(account, chainId, true)
        setTimeout(() => {
          ConnectionInstance.syncSuiAccountResources(account, chainId, true)
        }, REFRESH_TIMEOUT * 2)
      }, REFRESH_TIMEOUT)
    } catch (error) {
      setAttemptingTxn(false)
      console.error('onSuiRemove', error)
      throw error
    }
  }

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <RowBetween align="flex-end">
          <Text fontSize={24} fontWeight={500}>
            {amountPretty(parsedAmounts[Field.COIN_A], coinA?.decimals ?? 8)}
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
            {amountPretty(parsedAmounts[Field.COIN_B], coinB?.decimals ?? 8)}
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
            Output is estimated. If the price changes by more than {(allowedSlippage / 100).toFixed(2)}% your
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
            {coinA?.symbol}/{coinB?.symbol} Burned
          </Text>
          <RowFixed>
            <DoubleCoinLogo coinX={coinA} coinY={coinB} margin={true} />
            <Text fontWeight={500} fontSize={16}>
              {amountPretty(parsedAmounts[Field.LIQUIDITY], 8)}
            </Text>
          </RowFixed>
        </RowBetween>
        <>
          <RowBetween>
            <Text color={theme.deprecated_text2} fontWeight={500} fontSize={16}>
              <Trans>Price</Trans>
            </Text>
            <Text fontWeight={500} fontSize={16} color={theme.deprecated_text1}>
              1 {coinA?.symbol} = {price.toSD(6).toString()} {coinB?.symbol}
            </Text>
          </RowBetween>
          <RowBetween>
            <div />
            <Text fontWeight={500} fontSize={16} color={theme.deprecated_text1}>
              1 {coinB?.symbol} = {Utils.d(1).div(price).toSD(6).toString()} {coinA?.symbol}
            </Text>
          </RowBetween>
        </>
        <ButtonPrimary disabled={false} onClick={onRemove}>
          <Text fontWeight={500} fontSize={20}>
            <Trans>Confirm</Trans>
          </Text>
        </ButtonPrimary>
      </>
    )
  }

  const pendingText = (
    <>
      Withdrawing {coinA_amount?.prettyWithSymbol()} and {coinB_amount?.prettyWithSymbol()}
    </>
  )

  function onUserInput(field: Field, value: string) {
    console.log('onUserInput', field, value)
    const percent = Utils.d(value).div(100)
    setParsedAmounts({
      [Field.LIQUIDITY_PERCENT]: value,
      [Field.LIQUIDITY]: lpBalance.mul(percent).floor(),
      [Field.COIN_A]: coinAReserve.mul(percent).floor(),
      [Field.COIN_B]: coinBReserve.mul(percent).floor(),
    })
  }

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [setParsedAmounts]
  )

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT]),
    liquidityPercentChangeCallback
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [setParsedAmounts, txHash])

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
                    {parsedAmounts[Field.LIQUIDITY_PERCENT]}%
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
                    {amountPretty(parsedAmounts[Field.COIN_A], coinA?.decimals) || '-'}
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
                    {amountPretty(parsedAmounts[Field.COIN_B], coinB?.decimals) || '-'}
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
                  1 {coinB?.symbol} = {Utils.d(1).div(price).toSD(6).toString()} {coinA?.symbol}
                </div>
              </RowBetween>
            </div>
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
                    disabled={!isValid}
                    error={!isValid && !!parsedAmounts[Field.COIN_A] && !!parsedAmounts[Field.COIN_B]}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {error || <Trans>Remove</Trans>}
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
        <MinimalPositionCard pair={pair} nativePrice={nativePrice} />
      </AutoColumn>
    </>
  )
}
