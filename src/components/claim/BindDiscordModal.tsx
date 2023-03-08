import { Trans } from '@lingui/macro'
import { ReactComponent as Discord } from 'assets/discord.svg'
import axios from 'axios'
import { SupportedChainId } from 'constants/chains'
import { REFRESH_TIMEOUT } from 'constants/misc'
import { useEffect, useState } from 'react'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { useAccount } from 'state/wallets/hooks'
import styled from 'styled-components/macro'
import { shortenAddress } from 'utils'

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

const checkAddressBind = async (address: string) => {
  try {
    const res = await axios.get(`https://bind.animeswap.org/checkAddressBind?address=${address}`, {
      timeout: 5000,
    })
    // console.log(res)
    if (res.status === 200) {
      return res.data.bind
    }
  } catch (e) {
    console.error(e)
  }
}

export default function BindDiscordModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const account = useAccount()
  const chainId = useChainId()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const [alreadyBind, setAlreadyBind] = useState<boolean>(false)
  const [checkIsBindInterval, setCheckIsBindInterval] = useState<boolean>(false)

  // useEffect(() => {
  //   const checkBind = async () => {
  //     if (isOpen && account) {
  //       const isBind = await checkAddressBind(account)
  //       if (isBind) {
  //         setAlreadyBind(true)
  //       }
  //     }
  //   }
  //   checkBind()
  // }, [isOpen, account])

  // useEffect(() => {
  //   const checkBind = async () => {
  //     if (checkIsBindInterval && account && isOpen) {
  //       const isBind = await checkAddressBind(account)
  //       if (isBind) {
  //         setAlreadyBind(true)
  //         setCheckIsBindInterval(false)
  //       } else {
  //         setTimeout(() => {
  //           checkBind()
  //         }, 1500)
  //       }
  //     }
  //   }
  //   checkBind()
  // }, [checkIsBindInterval, account, isOpen])

  // monitor the status of the claim from contracts and txns
  const claimPending = useIsTransactionPending(hash ?? '')
  const claimConfirmed = hash && !claimPending

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
                  <Trans>Bind Discord For Airdrop $ANI</Trans>
                </ThemedText.DeprecatedWhite>
                <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="white" />
              </RowBetween>
            </CardSection>
            <Break />
          </ModalUpper>
          <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0', paddingBottom: '0' }} justify="start">
            <ThemedText.DeprecatedBody fontWeight={400}>
              1. For all Discord OG roles, bind Discord and Aptos address to get the incoming Airdrop{' '}
              <span style={{ color: '#b15bff', fontWeight: '800' }}>$ANI</span>.
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontWeight={400}>
              2. Each Discord account can only bind the{' '}
              <span style={{ color: 'red', fontWeight: '800' }}>first one</span> Aptos address. Once bound, you can't
              change it.
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontWeight={400}>
              3. The bind operation will close after{' '}
              <span style={{ color: 'red', fontWeight: '800' }}>November 1st 08:00 UTC</span>, please bind it in time.
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontWeight={400}>
              4. This is <span style={{ color: 'red', fontWeight: '800' }}>NOT the only way</span> to get the incoming
              Airdrop. Wait airdrop rule and address list announcement.
            </ThemedText.DeprecatedBody>
            {account && (
              <ThemedText.DeprecatedBody fontWeight={400}>
                <br />
                Connected Address: <span style={{ color: 'red', fontWeight: '800' }}>{shortenAddress(account, 8)}</span>
              </ThemedText.DeprecatedBody>
            )}
          </AutoColumn>
          <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0', paddingBottom: '2rem' }} justify="center">
            <ButtonPrimary
              disabled={!account || alreadyBind}
              padding="12px 12px"
              width="100%"
              $borderRadius="12px"
              mt="1rem"
              fontSize={20}
              onClick={() => {
                setCheckIsBindInterval(true)
                window.open(
                  `https://discord.com/oauth2/authorize?response_type=code&client_id=1035092636085796874&scope=identify%20guilds%20guilds.members.read&state=${account}&redirect_uri=https://bind.animeswap.org/bind&prompt=consent`,
                  '_blank'
                )
                // window.open(
                //   `https://discord.com/oauth2/authorize?response_type=code&client_id=1035092636085796874&scope=identify%20guilds%20guilds.members.read&state=${account}&redirect_uri=http://localhost:3001/bind&prompt=consent`,
                //   '_blank'
                // )
              }}
            >
              {!account && <>No Connected Wallet</>}
              {account && !alreadyBind && (
                <>
                  Bind
                  <Discord width="30px" height="30px" fill="#EEE" style={{ paddingLeft: '4px' }}></Discord>
                </>
              )}
              {account && alreadyBind && <>Already Bind</>}
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
