import { Trans } from '@lingui/macro'
import { ReactNode, useState } from 'react'
import { useAccount } from 'state/wallets/hooks'
import styled from 'styled-components/macro'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, ThemedText } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: any
}

export default function UnstakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const account = useAccount()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onWithdraw() {
    //
  }

  let error: ReactNode | undefined
  if (!account) {
    error = <Trans>Connect a wallet</Trans>
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? <Trans>Enter an amount</Trans>
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <ThemedText.DeprecatedMediumHeader>
              <Trans>Withdraw</Trans>
            </ThemedText.DeprecatedMediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {stakingInfo?.stakedAmount && (
            <AutoColumn justify="center" gap="md">
              <ThemedText.DeprecatedBody fontWeight={600} fontSize={36}>
                {/* {<FormattedCoinAmount currencyAmount={stakingInfo.stakedAmount} />} */}
              </ThemedText.DeprecatedBody>
              <ThemedText.DeprecatedBody>
                <Trans>Deposited liquidity:</Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          )}
          {stakingInfo?.earnedAmount && (
            <AutoColumn justify="center" gap="md">
              <ThemedText.DeprecatedBody fontWeight={600} fontSize={36}>
                {/* {<FormattedCoinAmount currencyAmount={stakingInfo?.earnedAmount} />} */}
              </ThemedText.DeprecatedBody>
              <ThemedText.DeprecatedBody>
                <Trans>Unclaimed UNI</Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          )}
          <ThemedText.DeprecatedSubHeader style={{ textAlign: 'center' }}>
            <Trans>When you withdraw, your UNI is claimed and your liquidity is removed from the mining pool.</Trans>
          </ThemedText.DeprecatedSubHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onWithdraw}>
            {error ?? <Trans>Withdraw & Claim</Trans>}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Withdrawing {stakingInfo?.stakedAmount?.toSignificant(4)} UNI-V2</Trans>
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Claiming {stakingInfo?.earnedAmount?.toSignificant(4)} UNI</Trans>
            </ThemedText.DeprecatedBody>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.DeprecatedLargeHeader>
              <Trans>Transaction Submitted</Trans>
            </ThemedText.DeprecatedLargeHeader>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Withdrew UNI-V2!</Trans>
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Claimed UNI!</Trans>
            </ThemedText.DeprecatedBody>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
