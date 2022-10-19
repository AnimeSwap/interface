// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
// import { TokenList } from '@uniswap/token-lists'
import logo from 'assets/logo.png'
import { sendEvent } from 'components/analytics'
import Card from 'components/Card'
import { ImportCoinList, useCoinList } from 'hooks/common/Coin'
// import { UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { useListColor } from 'hooks/useColor'
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle, Settings } from 'react-feather'
import { usePopper } from 'react-popper'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'
import styled from 'styled-components/macro'
import uriToHttp from 'utils/uriToHttp'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import useTheme from '../../hooks/useTheme'
import useToggle from '../../hooks/useToggle'
import { acceptListUpdate, disableList, enableList, removeList } from '../../state/lists/actions'
import { useAllLists } from '../../state/lists/hooks'
import { ExternalLink, IconWrapper, LinkStyledButton, ThemedText } from '../../theme'
// import listVersionLabel from '../../utils/listVersionLabel'
import { ButtonEmpty, ButtonPrimary } from '../Button'
import Column, { AutoColumn } from '../Column'
import ListLogo from '../ListLogo'
import Row, { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import { CoinModalView } from './CoinSearchModal'
import { PaddedColumn, SearchInput, Separator, SeparatorDark } from './styleds'

const Wrapper = styled(Column)`
  flex: 1;
  overflow-y: hidden;
`

const UnpaddedLinkStyledButton = styled(LinkStyledButton)`
  padding: 0;
  font-size: 1rem;
  opacity: ${({ disabled }) => (disabled ? '0.4' : '1')};
`

const PopoverContainer = styled.div<{ show: boolean }>`
  z-index: 100;
  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;
  background: ${({ theme }) => theme.deprecated_bg2};
  border: 1px solid ${({ theme }) => theme.deprecated_bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  color: ${({ theme }) => theme.deprecated_text2};
  border-radius: 0.5rem;
  padding: 1rem;
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 8px;
  font-size: 1rem;
  text-align: left;
`

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
`

const StyledTitleText = styled.div<{ active: boolean }>`
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: ${({ theme, active }) => (active ? theme.deprecated_white : theme.deprecated_text2)};
`

const StyledListUrlText = styled(ThemedText.DeprecatedMain)<{ active: boolean }>`
  font-size: 12px;
  color: ${({ theme, active }) => (active ? theme.deprecated_white : theme.deprecated_text2)};
`

const RowWrapper = styled(Row)<{ bgColor: string; active: boolean; hasActiveTokens: boolean }>`
  background-color: ${({ bgColor, active, theme }) => (active ? bgColor ?? 'transparent' : theme.deprecated_bg2)};
  opacity: ${({ hasActiveTokens }) => (hasActiveTokens ? 1 : 0.4)};
  transition: 200ms;
  align-items: center;
  padding: 1rem;
  border-radius: 20px;
`

function listUrlRowHTMLId(listUrl: string) {
  return `list-row-${listUrl.replace(/\./g, '-')}`
}

const ListRow = memo(function ListRow({ listUrl }: { listUrl: string }) {
  const chainId = useChainId()
  const listsByUrl = useAppSelector((state) => state.lists.byUrl)
  const dispatch = useAppDispatch()
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl]

  const activeTokensOnThisChain = useCoinList().length

  const theme = useTheme()
  const listColor = useListColor(list?.logoURL)
  const isActive = true

  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement>()
  const [popperElement, setPopperElement] = useState<HTMLDivElement>()

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'auto',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [8, 8] } }],
  })

  useOnClickOutside(node, open ? toggle : undefined)

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return
    sendEvent({
      category: 'Lists',
      action: 'Update List from List Select',
      label: listUrl,
    })
    dispatch(acceptListUpdate(listUrl))
  }, [dispatch, listUrl, pending])

  const handleRemoveList = useCallback(() => {
    sendEvent({
      category: 'Lists',
      action: 'Start Remove List',
      label: listUrl,
    })
    if (window.prompt(t`Please confirm you would like to remove this list by typing REMOVE`) === `REMOVE`) {
      sendEvent({
        category: 'Lists',
        action: 'Confirm Remove List',
        label: listUrl,
      })
      dispatch(removeList(listUrl))
    }
  }, [dispatch, listUrl])

  const handleEnableList = useCallback(() => {
    sendEvent({
      category: 'Lists',
      action: 'Enable List',
      label: listUrl,
    })
    dispatch(enableList(listUrl))
  }, [dispatch, listUrl])

  const handleDisableList = useCallback(() => {
    sendEvent({
      category: 'Lists',
      action: 'Disable List',
      label: listUrl,
    })
    dispatch(disableList(listUrl))
  }, [dispatch, listUrl])

  if (!list) return null

  return (
    <RowWrapper
      active={isActive}
      hasActiveTokens={activeTokensOnThisChain > 0}
      bgColor={listColor}
      key={listUrl}
      id={listUrlRowHTMLId(listUrl)}
    >
      {list.logoURL ? (
        <ListLogo size="40px" style={{ marginRight: '1rem' }} logoURL={list.logoURL} alt={`${list.name} list logo`} />
      ) : (
        <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />
      )}
      <Column style={{ flex: '1' }}>
        <Row>
          <StyledTitleText active={isActive}>{list.name}</StyledTitleText>
        </Row>
        <RowFixed mt="4px">
          <StyledListUrlText active={isActive} mr="6px">
            <Trans>{activeTokensOnThisChain} tokens</Trans>
          </StyledListUrlText>
          <StyledMenu ref={node as any}>
            <ButtonEmpty onClick={toggle} ref={setReferenceElement} padding="0">
              <Settings stroke={isActive ? theme.deprecated_bg1 : theme.deprecated_text1} size={12} />
            </ButtonEmpty>
            {open && (
              <PopoverContainer show={true} ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
                <SeparatorDark />
                <UnpaddedLinkStyledButton onClick={handleRemoveList} disabled={true}>
                  <Trans>Remove list</Trans>
                </UnpaddedLinkStyledButton>
                {pending && (
                  <UnpaddedLinkStyledButton onClick={handleAcceptListUpdate}>
                    <Trans>Update list</Trans>
                  </UnpaddedLinkStyledButton>
                )}
              </PopoverContainer>
            )}
          </StyledMenu>
        </RowFixed>
      </Column>
      <Toggle
        isActive={isActive}
        bgColor={listColor}
        toggle={() => {
          isActive ? handleDisableList() : handleEnableList()
        }}
      />
    </RowWrapper>
  )
})

const ListContainer = styled.div`
  padding: 1rem;
  height: 100%;
  overflow: auto;
  flex: 1;
`

export function ManageLists({
  setModalView,
  setImportList,
  setListUrl,
}: {
  setModalView: (view: CoinModalView) => void
  setImportList: (list: ImportCoinList) => void
  setListUrl: (url: string) => void
}) {
  const [listUrlInput, setListUrlInput] = useState<string>('')

  const lists = useAllLists()

  const tokenCountByListName = useCoinList().length

  // sort by active but only if not visible
  const activeListUrls = []

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setListUrlInput(e.target.value)
  }, [])

  const validUrl: boolean = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0
  }, [listUrlInput])

  const sortedLists = useMemo(() => {
    const listUrls = Object.keys(lists)
    return listUrls
      .filter((listUrl) => {
        // only show loaded lists, hide unsupported lists
        return Boolean(lists[listUrl].current)
      })
      .sort((listUrlA, listUrlB) => {
        const { current: listA } = lists[listUrlA]
        const { current: listB } = lists[listUrlB]

        // first filter on active lists
        if (activeListUrls?.includes(listUrlA) && !activeListUrls?.includes(listUrlB)) {
          return -1
        }
        if (!activeListUrls?.includes(listUrlA) && activeListUrls?.includes(listUrlB)) {
          return 1
        }

        if (listA && listB) {
          if (tokenCountByListName[listA.name] > tokenCountByListName[listB.name]) {
            return -1
          }
          if (tokenCountByListName[listA.name] < tokenCountByListName[listB.name]) {
            return 1
          }
          return listA.name.toLowerCase() < listB.name.toLowerCase()
            ? -1
            : listA.name.toLowerCase() === listB.name.toLowerCase()
            ? 0
            : 1
        }
        if (listA) return -1
        if (listB) return 1
        return 0
      })
  }, [lists, activeListUrls, tokenCountByListName])

  // temporary fetched list for import flow
  // const [tempList, setTempList] = useState<TokenList>()
  const [addError, setAddError] = useState<string | undefined>()

  // check if list is already imported
  const isImported = Object.keys(lists).includes(listUrlInput)

  // set list values and have parent modal switch to import list view
  const handleImport = useCallback(() => {
    // setImportList(tempList)
    setModalView(CoinModalView.importList)
    setListUrl(listUrlInput)
  }, [listUrlInput, setListUrl, setModalView])

  return (
    <Wrapper>
      {/* <PaddedColumn gap="14px">
        <Row>
          <SearchInput
            type="text"
            id="list-add-input"
            placeholder={t`https:// or ipfs:// or ENS name`}
            value={listUrlInput}
            onChange={handleInput}
          />
        </Row>
        {addError ? (
          <ThemedText.DeprecatedError title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} error>
            {addError}
          </ThemedText.DeprecatedError>
        ) : null}
      </PaddedColumn> */}
      <Separator />
      <ListContainer>
        <AutoColumn gap="md">
          {/* {sortedLists.map((listUrl) => (
            <ListRow key={listUrl} listUrl={listUrl} />
          ))} */}
          <RowWrapper active={true} hasActiveTokens={true} bgColor={'#8A2BE2'} key={''} id={'animeswap'}>
            <img
              src={logo}
              alt="ANI"
              style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '1rem' }}
            />
            <Column style={{ flex: '1' }}>
              <Row>
                <StyledTitleText active={true}>AnimeSwap</StyledTitleText>
              </Row>
              <RowFixed mt="4px">
                <StyledListUrlText active={true} mr="6px">
                  {tokenCountByListName} coins
                </StyledListUrlText>
              </RowFixed>
            </Column>
            <Toggle
              isActive={true}
              bgColor={'#8A2BE2'}
              toggle={() => {
                return
              }}
            />
          </RowWrapper>
        </AutoColumn>
      </ListContainer>
    </Wrapper>
  )
}
