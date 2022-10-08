import { Trans } from '@lingui/macro'
import { RowBetween } from 'components/Row'
import { Coin, ImportCoinList } from 'hooks/common/Coin'
import { useState } from 'react'
import { ArrowLeft } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { CloseIcon } from 'theme'

import { CoinModalView } from './CoinSearchModal'
import { ManageLists } from './ManageLists'
import ManageTokens from './ManageTokens'
import { PaddedColumn, Separator } from './styleds'

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-flow: column;
`

const ToggleWrapper = styled(RowBetween)`
  background-color: ${({ theme }) => theme.deprecated_bg3};
  border-radius: 12px;
  padding: 6px;
`

const ToggleOption = styled.div<{ active?: boolean }>`
  width: 48%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 600;
  background-color: ${({ theme, active }) => (active ? theme.deprecated_bg1 : theme.deprecated_bg3)};
  color: ${({ theme, active }) => (active ? theme.deprecated_text1 : theme.deprecated_text2)};
  user-select: none;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

export default function Manage({
  onDismiss,
  setModalView,
  setImportList,
  setImportToken,
  setListUrl,
}: {
  onDismiss: () => void
  setModalView: (view: CoinModalView) => void
  setImportToken: (token: Coin) => void
  setImportList: (list: ImportCoinList) => void
  setListUrl: (url: string) => void
}) {
  // toggle between tokens and lists
  const [showLists, setShowLists] = useState(true)

  return (
    <Wrapper>
      <PaddedColumn>
        <RowBetween>
          <ArrowLeft style={{ cursor: 'pointer' }} onClick={() => setModalView(CoinModalView.search)} />
          <Text fontWeight={500} fontSize={20}>
            <Trans>Manage</Trans>
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </PaddedColumn>
      <Separator />
      {/* <PaddedColumn style={{ paddingBottom: 0 }}>
        <ToggleWrapper>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={showLists}>
            <Trans>Lists</Trans>
          </ToggleOption>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={!showLists}>
            <Trans>Tokens</Trans>
          </ToggleOption>
        </ToggleWrapper>
      </PaddedColumn> */}
      {showLists ? (
        <ManageLists setModalView={setModalView} setImportList={setImportList} setListUrl={setListUrl} />
      ) : (
        <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
      )}
    </Wrapper>
  )
}
