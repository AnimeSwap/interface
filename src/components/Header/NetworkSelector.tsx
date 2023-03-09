import { Trans } from '@lingui/macro'
import { getChainInfo } from 'constants/chainInfo'
import { CHAIN_IDS_TO_NAMES, SupportedChainId } from 'constants/chains'
import useParsedQueryString from 'hooks/useParsedQueryString'
import usePrevious from 'hooks/usePrevious'
import { darken } from 'polished'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, ArrowDownCircle, ChevronDown } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCloseModal, useModalIsOpen, useOpenModal, useToggleModal } from 'state/application/hooks'
import { addPopup, ApplicationModal } from 'state/application/reducer'
import { switchChain, useConnection } from 'state/connection/hooks'
import { updateConnectionError } from 'state/connection/reducer'
import { useAppDispatch } from 'state/hooks'
import { useChainId } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
import { replaceURLParam } from 'utils'
import { isDevelopmentEnv, isProductionEnv } from 'utils/env'
import { isMobile } from 'utils/userAgent'

const ActiveRowLinkList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  & > a {
    align-items: center;
    color: ${({ theme }) => theme.deprecated_text2};
    display: flex;
    flex-direction: row;
    font-size: 14px;
    font-weight: 500;
    justify-content: space-between;
    padding: 8px 0 4px;
    text-decoration: none;
  }
  & > a:first-child {
    margin: 0;
    margin-top: 0px;
    padding-top: 10px;
  }
`
const ActiveRowWrapper = styled.div`
  background-color: ${({ theme }) => theme.deprecated_bg1};
  border-radius: 8px;
  cursor: pointer;
  padding: 8px;
  width: 100%;
`
const FlyoutHeader = styled.div`
  color: ${({ theme }) => theme.deprecated_text2};
  cursor: default;
  font-weight: 400;
`
const FlyoutMenu = styled.div`
  position: absolute;
  top: 54px;
  width: 272px;
  z-index: 99;
  padding-top: 10px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    top: 40px;
  }
`
const FlyoutMenuContents = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.deprecated_bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow: auto;
  padding: 16px;
  & > *:not(:last-child) {
    margin-bottom: 12px;
  }
`
const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  background-color: ${({ active, theme }) => (active ? theme.deprecated_bg1 : 'transparent')};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
  text-align: left;
  width: 100%;
`
const FlyoutRowActiveIndicator = styled.div`
  background-color: ${({ theme }) => theme.deprecated_green1};
  border-radius: 50%;
  height: 9px;
  width: 9px;
`

const CircleContainer = styled.div`
  width: 20px;
  display: flex;
  justify-content: center;
`

const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 16px;
  height: 16px;
`
const Logo = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 8px;
`
const NetworkLabel = styled.div`
  flex: 1 1 auto;
`
const SelectorLabel = styled(NetworkLabel)`
  display: none;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
    margin-right: 8px;
  }
`
const NetworkAlertLabel = styled(NetworkLabel)`
  display: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.4rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
  }
`
const SelectorControls = styled.div<{ supportedChain: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.deprecated_bg0};
  border: 2px solid ${({ theme }) => theme.deprecated_bg0};
  border-radius: 16px;
  color: ${({ theme }) => theme.deprecated_text1};
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
  ${({ supportedChain, theme }) =>
    !supportedChain &&
    `
    color: ${theme.deprecated_white};
    background-color: ${theme.deprecated_red1};
    border: 2px solid ${theme.deprecated_red1};
  `}
  cursor: default;
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.deprecated_red1)};
  }
`
const SelectorLogo = styled(Logo)`
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin-right: 8px;
  }
`
const SelectorWrapper = styled.div`
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
`
const StyledChevronDown = styled(ChevronDown)`
  width: 16px;
`

const NetworkIcon = styled(AlertTriangle)`
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  width: 16px;
  height: 16px;
`

const BridgeLabel = ({ chainId }: { chainId: SupportedChainId }) => {
  switch (chainId) {
    default:
      return <Trans>Bridge</Trans>
  }
}
const ExplorerLabel = ({ chainId }: { chainId: SupportedChainId }) => {
  switch (chainId) {
    case SupportedChainId.APTOS:
    case SupportedChainId.APTOS_DEVNET:
    case SupportedChainId.APTOS_TESTNET:
      return <Trans>Aptos Explorer</Trans>
    default:
      return <Trans>Explorer</Trans>
  }
}

function Row({
  targetChain,
  onSelectChain,
}: {
  targetChain: SupportedChainId
  onSelectChain: (targetChain: number) => void
}) {
  const chainId = useChainId()
  const active = targetChain === chainId
  const { helpCenterUrl, explorer, bridge, label, logoUrl } = getChainInfo(targetChain)

  const rowContent = (
    <FlyoutRow onClick={() => onSelectChain(targetChain)} active={active}>
      <Logo src={logoUrl} />
      <NetworkLabel>{label}</NetworkLabel>
      {active && (
        <CircleContainer>
          <FlyoutRowActiveIndicator />
        </CircleContainer>
      )}
    </FlyoutRow>
  )

  if (active) {
    return (
      <ActiveRowWrapper>
        {rowContent}
        <ActiveRowLinkList>
          {bridge && (
            <ExternalLink href={bridge}>
              <BridgeLabel chainId={targetChain} />
              <CircleContainer>
                <LinkOutCircle />
              </CircleContainer>
            </ExternalLink>
          )}
          {explorer && (
            <ExternalLink href={explorer}>
              <ExplorerLabel chainId={targetChain} />
              <CircleContainer>
                <LinkOutCircle />
              </CircleContainer>
            </ExternalLink>
          )}
          {helpCenterUrl && (
            <ExternalLink href={helpCenterUrl}>
              <Trans>Help Center</Trans>
              <CircleContainer>
                <LinkOutCircle />
              </CircleContainer>
            </ExternalLink>
          )}
        </ActiveRowLinkList>
      </ActiveRowWrapper>
    )
  }
  return rowContent
}

export const getParsedChainId = (parsedQs?: ParsedQs) => {
  const chain = parsedQs?.chain
  if (!chain || typeof chain !== 'string') return

  return getChainIdFromName(chain)
}

const getChainIdFromName = (name: string) => {
  const entry = Object.entries(CHAIN_IDS_TO_NAMES).find(([_, n]) => n === name)
  const chainId = entry?.[0]
  return chainId ? parseInt(chainId) : undefined
}

const getChainNameFromId = (id: string | number) => {
  // casting here may not be right but fine to return undefined if it's not a supported chain ID
  return CHAIN_IDS_TO_NAMES[id as SupportedChainId] || ''
}

const NETWORK_SELECTOR_CHAINS = [SupportedChainId.APTOS]
NETWORK_SELECTOR_CHAINS.push(SupportedChainId.APTOS_TESTNET)
if (isDevelopmentEnv()) {
  NETWORK_SELECTOR_CHAINS.push(SupportedChainId.APTOS_DEVNET)
}
NETWORK_SELECTOR_CHAINS.push(SupportedChainId.SUI_DEVNET)
if (isDevelopmentEnv()) {
  NETWORK_SELECTOR_CHAINS.push(SupportedChainId.SUI_TESTNET)
}

export default function NetworkSelector() {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const connection = useConnection()
  const [previousChainId, setPreviousChainId] = useState<number | undefined>(undefined)

  // Can't use `usePrevious` because `chainId` can be undefined while activating.
  useEffect(() => {
    setPreviousChainId(chainId)
  }, [chainId, previousChainId])

  const parsedQs = useParsedQueryString()
  const urlChainId = getParsedChainId(parsedQs)
  const previousUrlChainId = usePrevious(urlChainId)

  const navigate = useNavigate()
  const { search } = useLocation()

  const node = useRef<HTMLDivElement>(null)
  const isOpen = useModalIsOpen(ApplicationModal.NETWORK_SELECTOR)
  const openModal = useOpenModal(ApplicationModal.NETWORK_SELECTOR)
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const toggleModal = useToggleModal(ApplicationModal.NETWORK_SELECTOR)

  const info = getChainInfo(chainId)

  const replaceURLChainParam = useCallback(() => {
    if (chainId) {
      navigate({ search: replaceURLParam(search, 'chain', getChainNameFromId(chainId)) }, { replace: true })
    }
  }, [chainId, search, navigate])

  const onSelectChain = useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      try {
        dispatch(updateConnectionError({ chainId: targetChain, error: undefined }))

        if (isProductionEnv()) {
          // link to staging website
          if (targetChain === SupportedChainId.APTOS_DEVNET) {
            window.open('https://staging.animeswap.org/#/swap?chain=aptos_devnet')
            return
          } else if (targetChain === SupportedChainId.APTOS_TESTNET) {
            window.open('https://staging.animeswap.org/#/swap?chain=aptos_testnet')
            return
          } else if (targetChain === SupportedChainId.SUI_DEVNET) {
            window.open('https://staging.animeswap.org/#/swap?chain=sui_devnet')
            return
          } else if (targetChain === SupportedChainId.SUI_TESTNET) {
            window.open('https://staging.animeswap.org/#/swap?chain=sui_testnet')
            return
          } else {
            switchChain(connection, targetChain)
            navigate({ search: replaceURLParam(search, 'chain', getChainNameFromId(targetChain)) }, { replace: true })
          }
        } else {
          switchChain(connection, targetChain)
          navigate({ search: replaceURLParam(search, 'chain', getChainNameFromId(targetChain)) }, { replace: true })
        }
      } catch (error) {
        console.error('Failed to switch networks', error)
        dispatch(updateConnectionError({ chainId: targetChain, error: error.message }))
        dispatch(addPopup({ content: { failedSwitchNetwork: targetChain }, key: `failed-network-switch` }))

        // If we activate a chain and it fails, reset the query param to the current chainId
        replaceURLChainParam()
      }

      if (!skipClose) {
        closeModal()
      }
    },
    [connection, chainId, closeModal, dispatch, replaceURLChainParam]
  )

  // If there is no chain query param, set it to the current chain
  useEffect(() => {
    const chainQueryUnpopulated = !urlChainId
    if (chainQueryUnpopulated && chainId) {
      replaceURLChainParam()
    }
  }, [chainId, urlChainId, replaceURLChainParam])

  // If the chain changed but the query param is stale, update to the current chain
  // useEffect(() => {
  //   const chainChanged = chainId !== previousChainId
  //   const chainQueryStale = urlChainId !== chainId
  //   if (chainChanged && chainQueryStale) {
  //     replaceURLChainParam()
  //   }
  // }, [chainId, previousChainId, replaceURLChainParam, urlChainId])

  // If the query param changed, and the chain didn't change, then activate the new chain
  useEffect(() => {
    const chainQueryManuallyUpdated = urlChainId && urlChainId !== previousUrlChainId
    if (chainQueryManuallyUpdated) {
      onSelectChain(urlChainId, true)
    }
  }, [onSelectChain, urlChainId, previousUrlChainId])

  const onSupportedChain = info !== undefined

  return (
    <SelectorWrapper
      ref={node}
      onMouseEnter={openModal}
      onMouseLeave={closeModal}
      onClick={isMobile ? toggleModal : undefined}
    >
      <SelectorControls supportedChain={onSupportedChain}>
        {onSupportedChain ? (
          <>
            <SelectorLogo src={info.logoUrl} />
            <SelectorLabel>{info.label}</SelectorLabel>
            <StyledChevronDown />
          </>
        ) : (
          <>
            <NetworkIcon />
            <NetworkAlertLabel>Switch Network</NetworkAlertLabel>
            <StyledChevronDown />
          </>
        )}
      </SelectorControls>
      {isOpen && (
        <FlyoutMenu>
          <FlyoutMenuContents>
            <FlyoutHeader>
              <Trans>Select a {!onSupportedChain ? ' supported ' : ''}network</Trans>
            </FlyoutHeader>
            {NETWORK_SELECTOR_CHAINS.map((chainId: SupportedChainId) => (
              <Row onSelectChain={onSelectChain} targetChain={chainId} key={chainId} />
            ))}
          </FlyoutMenuContents>
        </FlyoutMenu>
      )}
    </SelectorWrapper>
  )
}
