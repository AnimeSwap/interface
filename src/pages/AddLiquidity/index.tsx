import { Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { MinimalPositionCard } from 'components/PositionCard'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { SupportedChainId } from 'constants/chains'
import { BIG_INT_ZERO, BP, GAS_RESERVE, REFRESH_TIMEOUT } from 'constants/misc'
import { amountPretty, Coin, CoinAmount, useCoin } from 'hooks/common/Coin'
import { pairKey, PairState, useNativePrice } from 'hooks/common/Pair'
import { useCallback, useContext, useState } from 'react'
import { Plus } from 'react-feather'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import ConnectionInstance from 'state/connection/instance'
import { SignAndSubmitTransaction, useAccount, useLpBalance } from 'state/wallets/hooks'
import { ThemeContext } from 'styled-components/macro'

import { ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { BlueCard, LightCard } from '../../components/Card'
import CoinInputPanel from '../../components/CoinInputPanel'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import DoubleCoinLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import Row, { RowBetween, RowFlat } from '../../components/Row'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import { useToggleWalletModal } from '../../state/application/hooks'
import { Field } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'
import { useChainId, useNativeCoin, useUserSlippageTolerance } from '../../state/user/hooks'
import { ThemedText } from '../../theme'
import AppBody from '../AppBody'
import { Wrapper } from '../Pool/styleds'
import { ConfirmAddModalBottom } from './ConfirmAddModalBottom'
import { PoolPriceBar } from './PoolPriceBar'

const DEFAULT_ADD_SLIPPAGE_TOLERANCE = 50

export default function AddLiquidity() {
  const navigate = useNavigate()
  const chainId = useChainId()
  const account = useAccount()
  const nativeCoin = useNativeCoin()
  const nativePrice = useNativePrice()
  const { coinIdA, coinIdB } = useParams<{ coinIdA?: string; coinIdB?: string }>()
  const coinA = useCoin(coinIdA)
  const coinB = useCoin(coinIdB)

  // 'A, B' revert is false, 'B, A' revert is true
  const revert = coinA && coinB && !Utils.isSortedSymbols(coinA.address, coinB.address)
  const lpKey = revert ? pairKey(coinB?.address, coinA?.address) : pairKey(coinA?.address, coinB?.address)
  const lpBalance = Utils.d(useLpBalance(lpKey))

  const theme = useContext(ThemeContext)

  const toggleWalletModal = useToggleWalletModal() // toggle wallet when disconnected
  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    coins,
    pair,
    pairState,
    coinBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolCoinPercentage,
    error,
  } = useDerivedMintInfo(coinA, coinB, revert)

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const isValid = !error
  const creating = noLiquidity && coinA && coinB ? true : false

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const allowedSlippage = useUserSlippageTolerance()
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity
      ? otherTypedValue
      : parsedAmounts[dependentField] && coins[dependentField]
      ? parsedAmounts[dependentField].div(Utils.pow10(coins[dependentField]?.decimals))?.toSD(6).toString()
      : '',
  }

  const coinA_amount = coins[Field.COIN_A]
    ? new CoinAmount(coins[Field.COIN_A], parsedAmounts[Field.COIN_A])
    : undefined
  const coinB_amount = coins[Field.COIN_B]
    ? new CoinAmount(coins[Field.COIN_B], parsedAmounts[Field.COIN_B])
    : undefined

  async function onAdd() {
    try {
      const payload = ConnectionInstance.getSDK().swap.addLiquidityPayload({
        coinX: revert ? coinB.address : coinA.address,
        coinY: revert ? coinA.address : coinB.address,
        amountX: revert ? parsedAmounts[Field.COIN_B] : parsedAmounts[Field.COIN_A],
        amountY: revert ? parsedAmounts[Field.COIN_A] : parsedAmounts[Field.COIN_B],
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
      console.error('onAdd', error)
      throw error
    }
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap="20px">
        <LightCard mt="20px" $borderRadius="20px">
          <RowFlat>
            <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
              {coins[Field.COIN_A]?.symbol + '/' + coins[Field.COIN_B]?.symbol}
            </Text>
            <DoubleCoinLogo coinX={coins[Field.COIN_A]} coinY={coins[Field.COIN_B]} size={30} />
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap="20px">
        <RowFlat style={{ marginTop: '20px' }}>
          <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
            {amountPretty(liquidityMinted, 8)}
          </Text>
          <DoubleCoinLogo coinX={coins[Field.COIN_A]} coinY={coins[Field.COIN_B]} size={30} />
        </RowFlat>
        <Row>
          <Text fontSize="24px">
            {coins[Field.COIN_A]?.symbol + '/' + coins[Field.COIN_B]?.symbol + ' Pool Tokens'}
          </Text>
        </Row>
        <ThemedText.DeprecatedItalic fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
          <Trans>
            Output is estimated. If the price changes by more than {(allowedSlippage / 100).toFixed(2)}% your
            transaction will revert.
          </Trans>
        </ThemedText.DeprecatedItalic>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        coins={coins}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolCoinPercentage={poolCoinPercentage}
      />
    )
  }

  const pendingText = (
    <>
      Supplying {coinA_amount?.prettyWithSymbol()} and {coinB_amount?.prettyWithSymbol()}
    </>
  )

  const handleCurrencyASelect = useCallback(
    (coinX: Coin) => {
      const newCoinIdA = coinX.address
      if (newCoinIdA === coinIdB) {
        navigate(`/add/${coinIdB}/${coinIdA}`)
      } else {
        navigate(`/add/${newCoinIdA}/${coinIdB}`)
      }
    },
    [coinIdB, navigate, coinIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (coinY: Coin) => {
      const newCoinIdB = coinY.address
      if (coinIdA === newCoinIdB) {
        if (coinIdB) {
          navigate(`/add/${coinIdB}/${newCoinIdB}`)
        } else {
          navigate(`/add/${newCoinIdB}`)
        }
      } else {
        navigate(`/add/${coinIdA ? coinIdA : nativeCoin.address}/${newCoinIdB}`)
      }
    },
    [coinIdA, navigate, coinIdB]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  return (
    <>
      <AppBody>
        <AddRemoveTabs creating={creating} adding={true} defaultSlippage={DEFAULT_ADD_SLIPPAGE_TOLERANCE} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={() => (
              <ConfirmationModalContent
                title={creating ? <Trans>You are creating a pool</Trans> : <Trans>You will receive</Trans>}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn gap="20px">
            {creating ? (
              <ColumnCenter>
                <BlueCard>
                  <AutoColumn gap="10px">
                    <ThemedText.DeprecatedLink fontWeight={600} color={'deprecated_primaryText1'}>
                      <Trans>You are the first liquidity provider.</Trans>
                    </ThemedText.DeprecatedLink>
                    <ThemedText.DeprecatedLink fontWeight={400} color={'deprecated_primaryText1'}>
                      <Trans>The ratio of tokens you add will set the price of this pool.</Trans>
                    </ThemedText.DeprecatedLink>
                    <ThemedText.DeprecatedLink fontWeight={400} color={'deprecated_primaryText1'}>
                      <Trans>Once you are happy with the rate click supply to review.</Trans>
                    </ThemedText.DeprecatedLink>
                  </AutoColumn>
                </BlueCard>
              </ColumnCenter>
            ) : (
              <ColumnCenter>
                <BlueCard>
                  <AutoColumn gap="10px">
                    <ThemedText.DeprecatedLink fontWeight={400} color={'deprecated_primaryText1'}>
                      <Trans>
                        <b>
                          <Trans>Tip:</Trans>
                        </b>{' '}
                        When you add liquidity, you will receive pool tokens representing your position. These tokens
                        automatically earn fees proportional to your share of the pool, and can be redeemed at any time.
                      </Trans>
                    </ThemedText.DeprecatedLink>
                  </AutoColumn>
                </BlueCard>
              </ColumnCenter>
            )}
            <CoinInputPanel
              value={formattedAmounts[Field.COIN_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                const gasReserve = coinA.symbol === 'APT' ? GAS_RESERVE : BIG_INT_ZERO
                onFieldAInput(
                  coinBalances[Field.COIN_A]?.sub(gasReserve).div(Utils.pow10(coinA?.decimals)).toString() ?? ''
                )
              }}
              onCoinSelect={handleCurrencyASelect}
              showMaxButton={coinBalances[Field.COIN_A] && coinBalances[Field.COIN_A].greaterThan(0)}
              coin={coins[Field.COIN_A] ?? null}
              id="add-liquidity-input-tokena"
              showCommonBases
            />
            <ColumnCenter>
              <Plus size="16" color={theme.deprecated_text2} />
            </ColumnCenter>
            <CoinInputPanel
              value={formattedAmounts[Field.COIN_B]}
              onUserInput={onFieldBInput}
              onCoinSelect={handleCurrencyBSelect}
              onMax={() => {
                const gasReserve = coinB.symbol === 'APT' ? GAS_RESERVE : BIG_INT_ZERO
                onFieldBInput(
                  coinBalances[Field.COIN_B]?.sub(gasReserve).div(Utils.pow10(coinB?.decimals)).toString() ?? ''
                )
              }}
              showMaxButton={coinBalances[Field.COIN_B] && coinBalances[Field.COIN_B].greaterThan(0)}
              coin={coins[Field.COIN_B] ?? null}
              id="add-liquidity-input-tokenb"
              showCommonBases
            />
            {coins[Field.COIN_A] && coins[Field.COIN_B] && pairState !== PairState.INVALID && (
              <>
                <LightCard padding="0px" $borderRadius={'20px'}>
                  <RowBetween padding="1rem">
                    <ThemedText.DeprecatedSubHeader fontWeight={500} fontSize={14}>
                      {creating ? <Trans>Initial prices and pool share</Trans> : <Trans>Prices and pool share</Trans>}
                    </ThemedText.DeprecatedSubHeader>
                  </RowBetween>{' '}
                  <LightCard padding="1rem" $borderRadius={'20px'}>
                    <PoolPriceBar
                      coins={coins}
                      poolCoinPercentage={poolCoinPercentage}
                      noLiquidity={noLiquidity}
                      price={price}
                    />
                  </LightCard>
                </LightCard>
              </>
            )}

            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>
                <Trans>Connect Wallet</Trans>
              </ButtonLight>
            ) : (
              <AutoColumn gap={'md'}>
                <ButtonError
                  onClick={() => {
                    setShowConfirm(true)
                  }}
                  disabled={!isValid}
                  error={!isValid && !!parsedAmounts[Field.COIN_A] && !!parsedAmounts[Field.COIN_B]}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {error ?? <Trans>Supply</Trans>}
                  </Text>
                </ButtonError>
              </AutoColumn>
            )}
          </AutoColumn>
        </Wrapper>
      </AppBody>
      <SwitchLocaleLink />

      {lpBalance.gt(0) && pair && !noLiquidity && pairState !== PairState.INVALID ? (
        <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
          <MinimalPositionCard pair={pair} nativePrice={nativePrice} />
        </AutoColumn>
      ) : null}
    </>
  )
}
