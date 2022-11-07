import { Trans } from '@lingui/macro'
import { FarmCardProps } from 'components/PositionCard/farmCard'
import { SupportedChainId } from 'constants/chains'
import { REFRESH_TIMEOUT } from 'constants/misc'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { SignAndSubmitTransaction, useAccount } from 'state/wallets/hooks'
import styled from 'styled-components/macro'
import { shortenAddress } from 'utils'

import { CloseIcon, ExternalLink, ThemedText } from '../../theme'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { ButtonPrimary, ButtonSecondary } from '../Button'
import { AutoColumn } from '../Column'
import { Break, CardSection, DataCard } from '../earn/styled'
import { CardBGImage, CardNoise } from '../earn/styled'
import Modal from '../Modal'
import { AutoRow, RowBetween } from '../Row'

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

export default function StakeModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const account = useAccount()
  const chainId = useChainId()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>('')
  const farmCardProps: FarmCardProps = window.farmCardProps
  const isFarm = farmCardProps?.coinY ? true : false

  async function claimCall() {
    try {
      const payload = ConnectionInstance.getSDK().Misc.claimAirdropPayload()
      setAttempting(true)
      const txid = await SignAndSubmitTransaction(payload)
      setAttempting(false)
      setHash(txid)
      setTimeout(() => {
        ConnectionInstance.syncAccountResources(account, false)
        setTimeout(() => {
          ConnectionInstance.syncAccountResources(account, false)
        }, REFRESH_TIMEOUT * 2)
      }, REFRESH_TIMEOUT)
    } catch (e) {
      setAttempting(false)
    }
  }

  function wrappedOnDismiss() {
    setAttempting(false)
    setHash(undefined)
    onDismiss()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <ModalUpper>
            <CardBGImage />
            <CardNoise />
            <CardSection gap="md">
              <RowBetween>
                <ThemedText.DeprecatedWhite fontWeight={500}>
                  {isFarm ? 'Stake LP tokens' : 'Stake ANI'}
                </ThemedText.DeprecatedWhite>
                <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="white" />
              </RowBetween>
            </CardSection>
            <Break />
          </ModalUpper>
          <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0', paddingBottom: '0' }} justify="start">
            <ThemedText.DeprecatedBody fontWeight={400}>
              asdasdasdasdasdasdasdasdasdasdasdasdasdasd
            </ThemedText.DeprecatedBody>
          </AutoColumn>
          <AutoRow style={{ padding: '1rem', paddingTop: '0', paddingBottom: '0' }} justify="center">
            <ButtonSecondary
              disabled={false}
              padding="12px 12px"
              marginRight={'1rem'}
              width="44%"
              $borderRadius="12px"
              mt="1rem"
              onClick={wrappedOnDismiss}
            >
              Cancel
            </ButtonSecondary>
            <ButtonPrimary
              disabled={false}
              padding="12px 12px"
              width="44%"
              $borderRadius="12px"
              mt="1rem"
              onClick={() => {
                // claimCall()
              }}
            >
              Confirm
            </ButtonPrimary>
          </AutoRow>
          <AutoColumn gap="md" style={{ paddingTop: '0', paddingBottom: '2rem' }} justify="center">
            <ExternalLink
              href={isFarm ? `/add/${farmCardProps?.coinX?.address}/${farmCardProps?.coinY?.address}` : '/'}
            >
              Get {isFarm ? `${farmCardProps?.coinX?.symbol}-${farmCardProps?.coinY?.symbol}` : 'ANI'}
              <sup>↗</sup>
            </ExternalLink>
          </AutoColumn>
        </ContentWrapper>
      )}
      {(attempting || hash) && (
        <ConfirmOrLoadingWrapper activeBG={true}>
          <CardNoise />
          <RowBetween>
            <div />
            <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="black" />
          </RowBetween>
          <AutoColumn gap="100px" justify={'center'}>
            {attempting && !hash && (
              <ThemedText.DeprecatedSubHeader color="black">
                <Trans>Confirm this transaction in your wallet</Trans>
              </ThemedText.DeprecatedSubHeader>
            )}
            {attempting && hash && (
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
