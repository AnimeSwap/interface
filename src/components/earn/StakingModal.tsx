import { Decimal } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { useCallback, useState } from 'react'
import styled from 'styled-components/macro'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { CloseIcon, ThemedText } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import CoinInputPanel from '../CoinInputPanel'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import ProgressCircles from '../ProgressSteps'
import { RowBetween } from '../Row'

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;

  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: any
  userLiquidityUnstaked: Decimal | undefined
}

export default function StakingModal({ isOpen, onDismiss, stakingInfo, userLiquidityUnstaked }: StakingModalProps) {
  // track and parse user input
  const [typedValue, setTypedValue] = useState('')

  const hypotheticalRewardRate = new Decimal(10)
  const error = false
  const parsedAmount = new Decimal(10)

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])
  async function onStake() {
    //
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  // const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  // const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    // maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [])

  async function onAttemptToApprove() {
    //
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <ThemedText.DeprecatedMediumHeader>
              <Trans>Deposit</Trans>
            </ThemedText.DeprecatedMediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {/* <CoinInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={stakingInfo.stakedAmount.currency}
            pair={dummyPair}
            label={''}
            renderBalance={(amount) => <Trans>Available to deposit: {formatCurrencyAmount(amount, 4)}</Trans>}
            id="stake-liquidity-token"
          /> */}

          <HypotheticalRewardRate dim={!hypotheticalRewardRate.greaterThan('0')}>
            <div>
              <ThemedText.DeprecatedBlack fontWeight={600}>
                <Trans>Weekly Rewards</Trans>
              </ThemedText.DeprecatedBlack>
            </div>

            <ThemedText.DeprecatedBlack>
              <Trans>
                {hypotheticalRewardRate
                  .mul((60 * 60 * 24 * 7).toString())
                  .toSD(4)
                  .toString()}{' '}
                UNI / week
              </Trans>
            </ThemedText.DeprecatedBlack>
          </HypotheticalRewardRate>

          <RowBetween>
            <ButtonConfirmed mr="0.5rem" onClick={onAttemptToApprove}>
              <Trans>Approve</Trans>
            </ButtonConfirmed>
            <ButtonError error={!!error && !!parsedAmount} onClick={onStake}>
              {error ?? <Trans>Deposit</Trans>}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[true]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.DeprecatedLargeHeader>
              <Trans>Depositing Liquidity</Trans>
            </ThemedText.DeprecatedLargeHeader>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>{parsedAmount?.toSD(4).toString()} UNI-V2</Trans>
            </ThemedText.DeprecatedBody>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.DeprecatedLargeHeader>
              <Trans>Transaction Submitted</Trans>
            </ThemedText.DeprecatedLargeHeader>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Deposited {parsedAmount?.toSD(4).toString()} UNI-V2</Trans>
            </ThemedText.DeprecatedBody>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
