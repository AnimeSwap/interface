import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import { isAptosChain, isSuiChain } from 'constants/chains'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'react-feather'
import { ConnectionType } from 'state/connection/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'
import { useAccount, useConnectedWallets, useWallet } from 'state/wallets/hooks'
// import { AutoRow } from 'components/Row'
import styled from 'styled-components/macro'

import { ReactComponent as Close } from '../../assets/x.svg'
import { useModalIsOpen, useToggleWalletModal } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/reducer'
import AccountDetails from '../AccountDetails'
import Modal from '../Modal'
import BitkeepOption from './BitKeepOption'
import FewchaOption from './FewchaOption'
import MartianOption from './MartianOption'
import PetraOption from './PetraOption'
import PontemOption from './PontemOption'
import RiseOption from './RiseOption'
import SuiWalletOption from './SuiWalletOption'
import TrustWalletOption from './TrustWalletOption'

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.deprecated_text4};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.deprecated_primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.deprecated_bg0};
  padding: 0 1rem 1rem 1rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0 1rem 1rem 1rem`};
`

const UpperSection = styled.div`
  position: relative;
  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }
  h5:last-child {
    margin-bottom: 0px;
  }
  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

const HoverText = styled.div`
  text-decoration: none;
  color: ${({ theme }) => theme.deprecated_text1};
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
  }
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
}) {
  const account = useAccount()
  const walletType = useWallet()
  const chainId = useChainId()
  const [connectedWallets, addWalletToConnectedWallets] = useConnectedWallets()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const [lastActiveWalletAddress, setLastActiveWalletAddress] = useState<string | undefined>(account)

  const [pendingConnector, setPendingConnector] = useState<ConnectionType | undefined>()

  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useToggleWalletModal()

  const openOptions = useCallback(() => {
    setWalletView(WALLET_VIEWS.OPTIONS)
  }, [setWalletView])

  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(account ? WALLET_VIEWS.ACCOUNT : WALLET_VIEWS.OPTIONS)
    }
  }, [walletModalOpen, setWalletView, account])

  useEffect(() => {
    if (pendingConnector && walletView !== WALLET_VIEWS.PENDING) {
      setPendingConnector(undefined)
    }
  }, [pendingConnector, walletView])

  useEffect(() => {
    if (account && account !== lastActiveWalletAddress) {
      const isReconnect =
        connectedWallets.filter((wallet) => wallet.account === account && wallet.walletType === walletType).length > 0
      if (!isReconnect) addWalletToConnectedWallets({ account, walletType })
    }
    setLastActiveWalletAddress(account)
  }, [connectedWallets, addWalletToConnectedWallets, lastActiveWalletAddress, account, walletType, chainId])

  function getModalContent() {
    if (walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          openOptions={openOptions}
        />
      )
    }

    let headerRow
    if (walletView === WALLET_VIEWS.PENDING) {
      headerRow = null
    } else if (walletView === WALLET_VIEWS.ACCOUNT || !!account) {
      headerRow = (
        <HeaderRow color="blue">
          <HoverText onClick={() => setWalletView(account ? WALLET_VIEWS.ACCOUNT : WALLET_VIEWS.OPTIONS)}>
            <ArrowLeft />
          </HoverText>
        </HeaderRow>
      )
    } else {
      headerRow = (
        <HeaderRow>
          <HoverText>
            <Trans>Connect a wallet</Trans>
          </HoverText>
        </HeaderRow>
      )
    }

    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {headerRow}
        {isAptosChain(chainId) && (
          <ContentWrapper>
            <AutoColumn gap="16px">
              {walletView !== WALLET_VIEWS.PENDING && (
                <OptionGrid data-testid="option-grid">
                  <RiseOption />
                  <MartianOption />
                  <PetraOption />
                  <TrustWalletOption />
                  {/* <FewchaOption /> */}
                  <BitkeepOption />
                  <PontemOption />
                </OptionGrid>
              )}
            </AutoColumn>
          </ContentWrapper>
        )}
        {isSuiChain(chainId) && (
          <ContentWrapper>
            <AutoColumn gap="16px">
              {walletView !== WALLET_VIEWS.PENDING && (
                <OptionGrid data-testid="option-grid">
                  <SuiWalletOption />
                  <MartianOption />
                </OptionGrid>
              )}
            </AutoColumn>
          </ContentWrapper>
        )}
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
