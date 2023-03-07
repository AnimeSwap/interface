import { Trans } from '@lingui/macro'
import useScrollPosition from '@react-hook/window-scroll'
import { ReactComponent as Discord } from 'assets/discord.svg'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { isAptosChain, isSuiChain, SupportedChainId } from 'constants/chains'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { darken } from 'polished'
import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Text } from 'rebass'
import { useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { AutoConnectAptosWallets, AutoConnectSuiWallets, useAccount, useCoinAmount } from 'state/wallets/hooks'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'
import { isDevelopmentEnv } from 'utils/env'

import Logo from '../../assets/logo.png'
import { ButtonPrimary } from '../Button'
import Menu from '../Menu'
import Row from '../Row'
import HeaderStatus from './HeaderStatus'
import NetworkSelector, { getParsedChainId } from './NetworkSelector'

const HeaderFrame = styled.div<{ showBackground: boolean }>`
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem;
  z-index: 21;
  position: relative;
  /* Background slide effect on scroll. */
  background-image: ${({ theme }) => `linear-gradient(to bottom, transparent 50%, ${theme.deprecated_bg0} 50% )}}`};
  background-position: ${({ showBackground }) => (showBackground ? '0 -100%' : '0 0')};
  background-size: 100% 200%;
  box-shadow: 0px 0px 0px 1px ${({ theme, showBackground }) => (showBackground ? theme.deprecated_bg2 : 'transparent;')};
  transition: background-position 0.1s, box-shadow 0.1s;
  background-blend-mode: hard-light;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 48px 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:  1rem;
    grid-template-columns: 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding:  1rem;
    grid-template-columns: 36px 1fr;
  `};
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  &:not(:first-child) {
    margin-left: 0.25em;
  }

  /* addresses safaris lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 4px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.deprecated_bg0};
  width: fit-content;
  padding: 2px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    justify-self: start;
    `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    z-index: 99;
    position: fixed;
    bottom: 0; right: 50%;
    transform: translate(50%,-50%);
    margin: 0 auto;
    background-color: ${({ theme }) => theme.deprecated_bg0};
    border: 1px solid ${({ theme }) => theme.deprecated_bg2};
    box-shadow: 0px 6px 10px rgb(0 0 0 / 2%);
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.deprecated_bg0 : theme.deprecated_bg0)};
  border-radius: 16px;
  white-space: nowrap;
  width: 100%;
  height: 40px;

  :focus {
    border: 1px solid blue;
  }
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const AnimeIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }

  position: relative;
`

// can't be customized under react-router-dom v6
// so we have to persist to the default one, i.e., .active
const activeClassName = 'active'

const StyledNavLink = styled(NavLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.deprecated_text2};
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  &.${activeClassName} {
    border-radius: 14px;
    font-weight: 600;
    justify-content: center;
    color: ${({ theme }) => theme.deprecated_text1};
    background-color: ${({ theme }) => theme.deprecated_bg1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.deprecated_text1)};
  }
`

const StyledExternalLink = styled(ExternalLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.deprecated_text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.deprecated_text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.deprecated_text1)};
    text-decoration: none;
  }
`

const ANIbutton = styled(ButtonPrimary)`
  background-color: ${({ theme }) => theme.deprecated_bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
  border: none;
`

export default function Header() {
  const account = useAccount()
  const chainId = useChainId()
  const { nativeCoin, stableCoin, aniCoin } = getChainInfoOrDefault(chainId)
  const nativeCoinAmount = useCoinAmount(nativeCoin.address)

  // wallet
  useEffect(() => {
    if (isAptosChain(chainId)) {
      AutoConnectAptosWallets()
    } else if (isSuiChain(chainId)) {
      AutoConnectSuiWallets()
    }
  }, [chainId])

  useEffect(() => {
    if (isAptosChain(chainId)) {
      ConnectionInstance.getPair(nativeCoin.address, stableCoin.address)
      ConnectionInstance.getPair(nativeCoin.address, aniCoin.address)
      if (account) {
        ConnectionInstance.syncAccountResources(account, chainId, false)
      }
    } else if (isSuiChain(chainId)) {
      if (account) {
        ConnectionInstance.syncAccountResources(account, chainId, false)
      }
    }
  }, [account, chainId])

  const scrollY = useScrollPosition()
  const { pathname } = useLocation()

  // work around https://github.com/remix-run/react-router/issues/8161
  // as we can't pass function `({isActive}) => ''` to className with styled-components
  const isPoolActive =
    pathname.startsWith('/pool') ||
    pathname.startsWith('/add') ||
    pathname.startsWith('/remove') ||
    pathname.startsWith('/increase') ||
    pathname.startsWith('/find')

  const openClaimModal = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  // const openBindModal = useToggleModal(ApplicationModal.BIND_DISCORD)
  const openAirdropClaimModal = useToggleModal(ApplicationModal.ANI_AIRDROP_CLAIM)

  return (
    <HeaderFrame showBackground={scrollY > 45}>
      <Title href=".">
        <AnimeIcon>
          <img
            src={Logo}
            alt="ANI"
            style={{ width: '36px', height: '100%', borderRadius: '50%', boxShadow: '1px 1px 4px #000' }}
          />
        </AnimeIcon>
      </Title>
      <HeaderLinks>
        <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
          <Trans>Swap</Trans>
        </StyledNavLink>
        <StyledNavLink
          data-cy="pool-nav-link"
          id={`pool-nav-link`}
          to={'/pool'}
          className={isPoolActive ? activeClassName : undefined}
        >
          <Trans>Pool</Trans>
        </StyledNavLink>
        {/* {chainId === SupportedChainId.APTOS && (
          <StyledExternalLink id={`bridge-nav-link`} href={'https://cbridge.celer.network'}>
            <Trans>Bridge</Trans>
            <sup>↗</sup>
          </StyledExternalLink>
        )} */}
        <StyledNavLink id={`explore-nav-link`} to={'/charts'}>
          <Trans>Charts</Trans>
        </StyledNavLink>
      </HeaderLinks>

      <HeaderControls>
        <HeaderElement>
          {[SupportedChainId.APTOS_TESTNET, SupportedChainId.APTOS_DEVNET].includes(chainId) && (
            <ANIbutton
              onClick={() => {
                openClaimModal()
              }}
              padding="8px 12px"
              width="100%"
              $borderRadius="12px"
            >
              <Trans>Faucet</Trans>
            </ANIbutton>
          )}
          {/* {[SupportedChainId.APTOS].includes(chainId) && (
            <ANIbutton
              onClick={() => {
                window.open('https://cbridge.celer.network/1/12360001/USDC', '_blank')
              }}
              padding="8px 12px"
              width="100%"
              $borderRadius="12px"
            >
              <Trans>Bridge</Trans>
              <sup>↗</sup>
            </ANIbutton>
          )} */}
          {/* {[SupportedChainId.APTOS].includes(chainId) && (
            <ANIbutton
              onClick={() => {
                openBindModal()
              }}
              padding="4px 8px"
              width="100%"
              $borderRadius="12px"
            >
              Bind
              <Discord width="28px" height="28px" fill="#EEE" style={{ paddingLeft: '4px' }}></Discord>
            </ANIbutton>
          )} */}
          {/* {[SupportedChainId.APTOS_DEVNET, SupportedChainId.APTOS_TESTNET, SupportedChainId.APTOS].includes(
            chainId
          ) && (
            <ANIbutton
              onClick={() => {
                openAirdropClaimModal()
              }}
              padding="8px 12px"
              width="100%"
              $borderRadius="12px"
            >
              Claim
            </ANIbutton>
          )} */}
        </HeaderElement>
        <HeaderElement>
          <NetworkSelector />
        </HeaderElement>
        <HeaderElement>
          <AccountElement active={!!account}>
            {account && nativeCoinAmount ? (
              <BalanceText style={{ flexShrink: 0, userSelect: 'none' }} pl="0.75rem" pr=".4rem" fontWeight={500}>
                {nativeCoinAmount.pretty(4)} {nativeCoin.symbol}
              </BalanceText>
            ) : null}
            <HeaderStatus />
          </AccountElement>
        </HeaderElement>
        <HeaderElement>
          <Menu />
        </HeaderElement>
      </HeaderControls>
    </HeaderFrame>
  )
}
