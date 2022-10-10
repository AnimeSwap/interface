import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { sendEvent } from 'components/analytics'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useCallback, useContext, useState } from 'react'
import { Plus } from 'react-feather'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import { useAccount } from 'state/wallets/hooks'
import { ThemeContext } from 'styled-components/macro'
import styled from 'styled-components/macro'

import { ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { BlueCard, LightCard } from '../../components/Card'
import CoinInputPanel from '../../components/CoinInputPanel'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import DoubleCoinLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import Row, { RowBetween, RowFlat } from '../../components/Row'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import { ZERO_PERCENT } from '../../constants/misc'
import { useToggleWalletModal } from '../../state/application/hooks'
import { Field } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { useChainId, useUserSlippageToleranceWithDefault } from '../../state/user/hooks'
import { ThemedText } from '../../theme'
import AppBody from '../AppBody'
import { Dots, Wrapper } from '../Pool/styleds'
import { ConfirmAddModalBottom } from './ConfirmAddModalBottom'
import { PoolPriceBar } from './PoolPriceBar'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = 50

const TitleContainer = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  jusitfy-content: center;
  flex-direction: column;
`

export default function AddLiquidity() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA?: string; currencyIdB?: string }>()
  const navigate = useNavigate()
  const account = useAccount()
  const chainId = useChainId()

  const theme = useContext(ThemeContext)

  const toggleWalletModal = useToggleWalletModal() // toggle wallet when disconnected
  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  // const {
  //   dependentField,
  //   currencies,
  //   pair,
  //   pairState,
  //   currencyBalances,
  //   parsedAmounts,
  //   price,
  //   noLiquidity,
  //   liquidityMinted,
  //   poolTokenPercentage,
  //   error,
  // } = useDerivedMintInfo()

  // const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  // const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE) // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  // const formattedAmounts = {
  //   [independentField]: typedValue,
  //   [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  // }

  const maxAmounts = {
    [Field.CURRENCY_A]: new Decimal(0),
    [Field.CURRENCY_B]: new Decimal(0),
  }

  const addTransaction = useTransactionAdder()

  async function onAdd() {
    //
  }

  // const modalHeader = () => {
  //   return noLiquidity ? (
  //     <AutoColumn gap="20px">
  //       <LightCard mt="20px" $borderRadius="20px">
  //         <RowFlat>
  //           <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
  //             {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol}
  //           </Text>
  //           <DoubleCoinLogo
  //             currency0={currencies[Field.CURRENCY_A]}
  //             currency1={currencies[Field.CURRENCY_B]}
  //             size={30}
  //           />
  //         </RowFlat>
  //       </LightCard>
  //     </AutoColumn>
  //   ) : (
  //     <AutoColumn gap="20px">
  //       <RowFlat style={{ marginTop: '20px' }}>
  //         <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
  //           {liquidityMinted?.toSignificant(6)}
  //         </Text>
  //         <DoubleCoinLogo
  //           currency0={currencies[Field.CURRENCY_A]}
  //           currency1={currencies[Field.CURRENCY_B]}
  //           size={30}
  //         />
  //       </RowFlat>
  //       <Row>
  //         <Text fontSize="24px">
  //           {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
  //         </Text>
  //       </Row>
  //       <ThemedText.DeprecatedItalic fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
  //         <Trans>
  //           Output is estimated. If the price changes by more than {allowedSlippage.toSignificantDigits(4).toString()}%
  //           your transaction will revert.
  //         </Trans>
  //       </ThemedText.DeprecatedItalic>
  //     </AutoColumn>
  //   )
  // }

  // const modalBottom = () => {
  //   return (
  //     <ConfirmAddModalBottom
  //       price={price}
  //       currencies={currencies}
  //       parsedAmounts={parsedAmounts}
  //       noLiquidity={noLiquidity}
  //       onAdd={onAdd}
  //       poolTokenPercentage={poolTokenPercentage}
  //     />
  //   )
  // }

  // const pendingText = (
  //   <Trans>
  //     Supplying {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} {currencies[Field.CURRENCY_A]?.symbol} and{' '}
  //     {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} {currencies[Field.CURRENCY_B]?.symbol}
  //   </Trans>
  // )

  // const handleCurrencyASelect = useCallback(
  //   (currencyA: Currency) => {
  //     const newCurrencyIdA = currencyId(currencyA)
  //     if (newCurrencyIdA === currencyIdB) {
  //       navigate(`/add/v2/${currencyIdB}/${currencyIdA}`)
  //     } else {
  //       navigate(`/add/v2/${newCurrencyIdA}/${currencyIdB}`)
  //     }
  //   },
  //   [currencyIdB, navigate, currencyIdA]
  // )
  // const handleCurrencyBSelect = useCallback(
  //   (currencyB: Currency) => {
  //     const newCurrencyIdB = currencyId(currencyB)
  //     if (currencyIdA === newCurrencyIdB) {
  //       if (currencyIdB) {
  //         navigate(`/add/v2/${currencyIdB}/${newCurrencyIdB}`)
  //       } else {
  //         navigate(`/add/v2/${newCurrencyIdB}`)
  //       }
  //     } else {
  //       navigate(`/add/v2/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
  //     }
  //   },
  //   [currencyIdA, navigate, currencyIdB]
  // )

  // const handleDismissConfirmation = useCallback(() => {
  //   setShowConfirm(false)
  //   // if there was a tx hash, we want to clear the input
  //   if (txHash) {
  //     onFieldAInput('')
  //   }
  //   setTxHash('')
  // }, [onFieldAInput, txHash])

  const { pathname } = useLocation()
  const isCreate = pathname.includes('/create')

  // const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  return (
    <>
      <TitleContainer>UI coming soon</TitleContainer>
      <TitleContainer>SDK is available now</TitleContainer>
    </>
  )

  // return (
  //   <>
  //     <AppBody>
  //       <AddRemoveTabs creating={isCreate} adding={true} defaultSlippage={DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE} />
  //       <Wrapper>
  //         {/* <TransactionConfirmationModal
  //           isOpen={showConfirm}
  //           onDismiss={handleDismissConfirmation}
  //           attemptingTxn={attemptingTxn}
  //           hash={txHash}
  //           content={() => (
  //             <ConfirmationModalContent
  //               title={noLiquidity ? <Trans>You are creating a pool</Trans> : <Trans>You will receive</Trans>}
  //               onDismiss={handleDismissConfirmation}
  //               topContent={modalHeader}
  //               bottomContent={modalBottom}
  //             />
  //           )}
  //           pendingText={pendingText}
  //           currencyToAdd={pair?.liquidityToken}
  //         /> */}
  //         <AutoColumn gap="20px">
  //           {noLiquidity ||
  //             (isCreate ? (
  //               <ColumnCenter>
  //                 <BlueCard>
  //                   <AutoColumn gap="10px">
  //                     <ThemedText.DeprecatedLink fontWeight={600} color={'deprecated_primaryText1'}>
  //                       <Trans>You are the first liquidity provider.</Trans>
  //                     </ThemedText.DeprecatedLink>
  //                     <ThemedText.DeprecatedLink fontWeight={400} color={'deprecated_primaryText1'}>
  //                       <Trans>The ratio of tokens you add will set the price of this pool.</Trans>
  //                     </ThemedText.DeprecatedLink>
  //                     <ThemedText.DeprecatedLink fontWeight={400} color={'deprecated_primaryText1'}>
  //                       <Trans>Once you are happy with the rate click supply to review.</Trans>
  //                     </ThemedText.DeprecatedLink>
  //                   </AutoColumn>
  //                 </BlueCard>
  //               </ColumnCenter>
  //             ) : (
  //               <ColumnCenter>
  //                 <BlueCard>
  //                   <AutoColumn gap="10px">
  //                     <ThemedText.DeprecatedLink fontWeight={400} color={'deprecated_primaryText1'}>
  //                       <Trans>
  //                         <b>
  //                           <Trans>Tip:</Trans>
  //                         </b>{' '}
  //                         When you add liquidity, you will receive pool tokens representing your position. These tokens
  //                         automatically earn fees proportional to your share of the pool, and can be redeemed at any
  //                         time.
  //                       </Trans>
  //                     </ThemedText.DeprecatedLink>
  //                   </AutoColumn>
  //                 </BlueCard>
  //               </ColumnCenter>
  //             ))}
  //           {/* <CoinInputPanel
  //             value={formattedAmounts[Field.CURRENCY_A]}
  //             onUserInput={onFieldAInput}
  //             onMax={() => {
  //               onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
  //             }}
  //             onCoinSelect={handleCurrencyASelect}
  //             showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
  //             currency={currencies[Field.CURRENCY_A] ?? null}
  //             id="add-liquidity-input-tokena"
  //             showCommonBases
  //           /> */}
  //           <ColumnCenter>
  //             <Plus size="16" color={theme.deprecated_text2} />
  //           </ColumnCenter>
  //           {/* <CoinInputPanel
  //             value={formattedAmounts[Field.CURRENCY_B]}
  //             onUserInput={onFieldBInput}
  //             onCoinSelect={handleCurrencyBSelect}
  //             onMax={() => {
  //               onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
  //             }}
  //             showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
  //             currency={currencies[Field.CURRENCY_B] ?? null}
  //             id="add-liquidity-input-tokenb"
  //             showCommonBases
  //           /> */}
  //           {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
  //             <>
  //               <LightCard padding="0px" $borderRadius={'20px'}>
  //                 <RowBetween padding="1rem">
  //                   <ThemedText.DeprecatedSubHeader fontWeight={500} fontSize={14}>
  //                     {noLiquidity ? (
  //                       <Trans>Initial prices and pool share</Trans>
  //                     ) : (
  //                       <Trans>Prices and pool share</Trans>
  //                     )}
  //                   </ThemedText.DeprecatedSubHeader>
  //                 </RowBetween>{' '}
  //                 <LightCard padding="1rem" $borderRadius={'20px'}>
  //                   <PoolPriceBar
  //                     currencies={currencies}
  //                     poolTokenPercentage={poolTokenPercentage}
  //                     noLiquidity={noLiquidity}
  //                     price={price}
  //                   />
  //                 </LightCard>
  //               </LightCard>
  //             </>
  //           )}

  //           {addIsUnsupported ? (
  //             <ButtonPrimary disabled={true}>
  //               <ThemedText.DeprecatedMain mb="4px">
  //                 <Trans>Unsupported Asset</Trans>
  //               </ThemedText.DeprecatedMain>
  //             </ButtonPrimary>
  //           ) : !account ? (
  //             <TraceEvent
  //               events={[Event.onClick]}
  //               name={EventName.CONNECT_WALLET_BUTTON_CLICKED}
  //               properties={{ received_swap_quote: false }}
  //               element={ElementName.CONNECT_WALLET_BUTTON}
  //             >
  //               <ButtonLight onClick={toggleWalletModal}>
  //                 <Trans>Connect Wallet</Trans>
  //               </ButtonLight>
  //             </TraceEvent>
  //           ) : (
  //             <AutoColumn gap={'md'}>
  //               {(approvalA === ApprovalState.NOT_APPROVED ||
  //                 approvalA === ApprovalState.PENDING ||
  //                 approvalB === ApprovalState.NOT_APPROVED ||
  //                 approvalB === ApprovalState.PENDING) &&
  //                 isValid && (
  //                   <RowBetween>
  //                     {approvalA !== ApprovalState.APPROVED && (
  //                       <ButtonPrimary
  //                         onClick={approveACallback}
  //                         disabled={approvalA === ApprovalState.PENDING}
  //                         width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
  //                       >
  //                         {approvalA === ApprovalState.PENDING ? (
  //                           <Dots>
  //                             <Trans>Approving {currencies[Field.CURRENCY_A]?.symbol}</Trans>
  //                           </Dots>
  //                         ) : (
  //                           <Trans>Approve {currencies[Field.CURRENCY_A]?.symbol}</Trans>
  //                         )}
  //                       </ButtonPrimary>
  //                     )}
  //                     {approvalB !== ApprovalState.APPROVED && (
  //                       <ButtonPrimary
  //                         onClick={approveBCallback}
  //                         disabled={approvalB === ApprovalState.PENDING}
  //                         width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
  //                       >
  //                         {approvalB === ApprovalState.PENDING ? (
  //                           <Dots>
  //                             <Trans>Approving {currencies[Field.CURRENCY_B]?.symbol}</Trans>
  //                           </Dots>
  //                         ) : (
  //                           <Trans>Approve {currencies[Field.CURRENCY_B]?.symbol}</Trans>
  //                         )}
  //                       </ButtonPrimary>
  //                     )}
  //                   </RowBetween>
  //                 )}
  //               <ButtonError
  //                 onClick={() => {
  //                   expertMode ? onAdd() : setShowConfirm(true)
  //                 }}
  //                 disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
  //                 error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
  //               >
  //                 <Text fontSize={20} fontWeight={500}>
  //                   {error ?? <Trans>Supply</Trans>}
  //                 </Text>
  //               </ButtonError>
  //             </AutoColumn>
  //           )}
  //         </AutoColumn>
  //       </Wrapper>
  //     </AppBody>
  //     <SwitchLocaleLink />

  //     {!addIsUnsupported ? (
  //       pair && !noLiquidity && pairState !== PairState.INVALID ? (
  //         <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
  //           <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
  //         </AutoColumn>
  //       ) : null
  //     ) : (
  //       <UnsupportedCurrencyFooter
  //         show={addIsUnsupported}
  //         currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
  //       />
  //     )}
  //   </>
  // )
}
