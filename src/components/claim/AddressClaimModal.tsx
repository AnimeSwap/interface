import { Trans } from '@lingui/macro'
import { SupportedChainId } from 'constants/chains'
import { REFRESH_TIMEOUT } from 'constants/misc'
import { useEffect, useState } from 'react'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { SignAndSubmitTransaction, useAccount } from 'state/wallets/hooks'
import styled from 'styled-components/macro'

import { useIsTransactionPending } from '../../state/transactions/hooks'
import { CloseIcon, ExternalLink, ThemedText } from '../../theme'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import { Break, CardSection, DataCard } from '../earn/styled'
import { CardBGImage, CardNoise } from '../earn/styled'
import Modal from '../Modal'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #021d43 100%);
`

const ConfirmOrLoadingWrapper = styled.div<{ activeBG: boolean }>`
  width: 100%;
  padding: 24px;
  position: relative;
  background: ${({ activeBG }) =>
    activeBG &&
    'radial-gradient(76.02% 75.41% at 1.84% 0%, rgba(255, 0, 122, 0.2) 0%, rgba(33, 114, 229, 0.2) 100%), #FFFFFF;'};
`

export default function AddressClaimModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const account = useAccount()
  const chainId = useChainId()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const [sinceBTC, setSinceBTC] = useState<Date>(new Date(0))
  const [sinceUSDT, setSinceUSDT] = useState<Date>(new Date(0))
  const [timeNow, setTimeNow] = useState(Date.now())

  // useEffect(() => {
  //   if ([SupportedChainId.APTOS_TESTNET].includes(chainId)) {
  //     setInterval(() => {
  //       setTimeNow(Date.now())
  //     }, 1e3)
  //   }
  // }, [])
  const formatTime = (time: number) => {
    const totalSeconds = Math.floor(time / 1e3)
    if (totalSeconds <= 0) return ''
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const period = 3600 * 1e3 // 60min

  // monitor the status of the claim from contracts and txns
  const claimPending = useIsTransactionPending(hash ?? '')
  const claimConfirmed = hash && !claimPending

  async function faucetBTC() {
    const transaction = {
      type: 'entry_function_payload',
      function: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::FaucetV1::request',
      type_arguments: ['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC'],
      arguments: ['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c'],
    }
    await SignAndSubmitTransaction(chainId, transaction)
    setTimeout(() => {
      updateSinceTimeBTC()
      ConnectionInstance.getCoinBalance(
        chainId,
        account,
        '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC'
      )
    }, REFRESH_TIMEOUT)
  }

  async function updateSinceTimeBTC() {
    if (account) {
      const res = await ConnectionInstance.getAccountResource(
        account,
        '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::FaucetV1::Restricted<0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::BTC>'
      )
      if (res && res.since) {
        const date = new Date(Number(res.since * 1e3) + period)
        setSinceBTC(date)
      } else {
        setSinceBTC(new Date(0))
      }
    }
  }

  async function faucetUSDT() {
    const transaction = {
      type: 'entry_function_payload',
      function: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::FaucetV1::request',
      type_arguments: ['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT'],
      arguments: ['0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c'],
    }
    await SignAndSubmitTransaction(chainId, transaction)
    setTimeout(() => {
      updateSinceTimeUSDT()
      ConnectionInstance.getCoinBalance(
        chainId,
        account,
        '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT'
      )
    }, REFRESH_TIMEOUT)
  }

  async function updateSinceTimeUSDT() {
    if (account) {
      const res = await ConnectionInstance.getAccountResource(
        account,
        '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::FaucetV1::Restricted<0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::TestCoinsV1::USDT>'
      )
      if (res && res.since) {
        const date = new Date(Number(res.since * 1e3) + period)
        setSinceUSDT(date)
      } else {
        setSinceUSDT(new Date(0))
      }
    }
  }

  // useEffect(() => {
  //   if ([SupportedChainId.APTOS_TESTNET].includes(chainId)) {
  //     updateSinceTimeBTC()
  //     updateSinceTimeUSDT()
  //   }
  // }, [account, chainId])

  function wrappedOnDismiss() {
    setAttempting(false)
    setHash(undefined)
    onDismiss()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && (
        <ContentWrapper gap="lg">
          <ModalUpper>
            <CardBGImage />
            <CardNoise />
            <CardSection gap="md">
              <RowBetween>
                <ThemedText.DeprecatedWhite fontWeight={500}>
                  <Trans>Faucet of Test Coins</Trans>
                </ThemedText.DeprecatedWhite>
                <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="white" />
              </RowBetween>
            </CardSection>
            <Break />
          </ModalUpper>
          <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0', paddingBottom: '0' }} justify="start">
            <ThemedText.DeprecatedSubHeader fontWeight={500}>
              Get APT coin from wallet airdrop.
            </ThemedText.DeprecatedSubHeader>
            <ThemedText.DeprecatedSubHeader fontWeight={500}>
              Get test BTC USDT for AnimeSwap testing, test coins are no practical value on Aptos DevNet.
            </ThemedText.DeprecatedSubHeader>
          </AutoColumn>
          <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0', paddingBottom: '2rem' }} justify="center">
            <ButtonPrimary
              disabled={!account || sinceBTC.getTime() > timeNow}
              padding="16px 16px"
              width="100%"
              $borderRadius="12px"
              mt="1rem"
              onClick={() => {
                faucetBTC()
              }}
            >
              {formatTime(sinceBTC.getTime() - timeNow)} Mint BTC
            </ButtonPrimary>
            <ButtonPrimary
              disabled={!account || sinceUSDT.getTime() > timeNow}
              padding="16px 16px"
              width="100%"
              $borderRadius="12px"
              mt="1rem"
              onClick={() => {
                faucetUSDT()
              }}
            >
              {formatTime(sinceUSDT.getTime() - timeNow)} Mint USDT
            </ButtonPrimary>
          </AutoColumn>
        </ContentWrapper>
      )}
      {(attempting || claimConfirmed) && (
        <ConfirmOrLoadingWrapper activeBG={true}>
          <CardNoise />
          <RowBetween>
            <div />
            <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="black" />
          </RowBetween>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <ThemedText.DeprecatedLargeHeader fontWeight={600} color="black">
                {claimConfirmed ? <Trans>Claimed</Trans> : <Trans>Claiming</Trans>}
              </ThemedText.DeprecatedLargeHeader>
            </AutoColumn>
            {claimConfirmed && (
              <>
                <ThemedText.DeprecatedSubHeader fontWeight={500} color="black">
                  <span role="img" aria-label="party-hat">
                    🎉{' '}
                  </span>
                  <Trans>Welcome to team Unicorn :) </Trans>
                  <span role="img" aria-label="party-hat">
                    🎉
                  </span>
                </ThemedText.DeprecatedSubHeader>
              </>
            )}
            {attempting && !hash && (
              <ThemedText.DeprecatedSubHeader color="black">
                <Trans>Confirm this transaction in your wallet</Trans>
              </ThemedText.DeprecatedSubHeader>
            )}
            {attempting && hash && !claimConfirmed && chainId && hash && (
              <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)} style={{ zIndex: 99 }}>
                <Trans>View transaction on Explorer</Trans>
              </ExternalLink>
            )}
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
    </Modal>
  )
}
