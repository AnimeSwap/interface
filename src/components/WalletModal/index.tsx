import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
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
import MartianOption from './MartianOption'
import PetraOption from './PetraOption'

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
  ENSName,
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  const account = useAccount()
  const walletType = useWallet()
  const chainId = useChainId()
  const [connectedWallets, addWalletToConnectedWallets] = useConnectedWallets()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const [lastActiveWalletAddress, setLastActiveWalletAddress] = useState<string | undefined>(account)
  const [shouldLogWalletBalances, setShouldLogWalletBalances] = useState(false)

  const [pendingConnector, setPendingConnector] = useState<ConnectionType | undefined>()

  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useToggleWalletModal()

  // const [tokenBalances, tokenBalancesIsLoading] = useAllTokenBalances()
  // const sortedTokens: Token[] = useMemo(
  //   () => (!tokenBalancesIsLoading ? Object.values(allTokens).sort(tokenComparator.bind(null, tokenBalances)) : []),
  //   [tokenBalances, allTokens, tokenBalancesIsLoading]
  // )
  // const native = usenativeCoin()

  // const sortedTokensWithETH: Currency[] = useMemo(
  //   () =>
  //     // Always bump the native token to the top of the list.
  //     native ? [native, ...sortedTokens.filter((t) => !t.equals(native))] : sortedTokens,
  //   [native, sortedTokens]
  // )

  // const balances = useCurrencyBalances(account, sortedTokensWithETH)
  const balances = useMemo(() => [], [])
  const nativeBalance = balances.length > 0 ? balances[0] : null

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

  // When new wallet is successfully set by the user, trigger logging of Amplitude analytics event.
  useEffect(() => {
    if (account && account !== lastActiveWalletAddress) {
      const isReconnect =
        connectedWallets.filter((wallet) => wallet.account === account && wallet.walletType === walletType).length > 0
      setShouldLogWalletBalances(true)
      if (!isReconnect) addWalletToConnectedWallets({ account, walletType })
    }
    setLastActiveWalletAddress(account)
  }, [connectedWallets, addWalletToConnectedWallets, lastActiveWalletAddress, account, walletType, chainId])

  // Send wallet balance info once it becomes available.
  useEffect(() => {
    // if (!tokenBalancesIsLoading && shouldLogWalletBalances && balances && nativeCoinBalanceUsdValue) {
    if (shouldLogWalletBalances && balances) {
      setShouldLogWalletBalances(false)
    }
  }, [
    balances,
    shouldLogWalletBalances,
    setShouldLogWalletBalances,
    // tokenBalancesIsLoading,
    // native,
  ])

  function getModalContent() {
    if (walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
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
        <ContentWrapper>
          <AutoColumn gap="16px">
            {walletView !== WALLET_VIEWS.PENDING && (
              <OptionGrid data-testid="option-grid">
                <PetraOption />
                <MartianOption />
              </OptionGrid>
            )}
            {/* {!pendingError && (
              <LightCard>
                <AutoRow style={{ flexWrap: 'nowrap' }}>
                  <ThemedText.DeprecatedBody fontSize={12}>
                    <Trans>
                      By connecting a wallet, you agree to Uniswap Labs’{' '}
                      <ExternalLink
                        style={{ textDecoration: 'underline' }}
                        href="https://uniswap.org/terms-of-service/"
                      >
                        Terms of Service
                      </ExternalLink>{' '}
                      and acknowledge that you have read and understand the Uniswap{' '}
                      <ExternalLink style={{ textDecoration: 'underline' }} href="https://uniswap.org/disclaimer/">
                        Protocol Disclaimer
                      </ExternalLink>
                      .
                    </Trans>
                  </ThemedText.DeprecatedBody>
                </AutoRow>
              </LightCard>
            )} */}
          </AutoColumn>
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
