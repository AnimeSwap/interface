import { Trans } from '@lingui/macro'
import { sendEvent } from 'components/analytics'
import { ButtonPrimary } from 'components/Button'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import ListLogo from 'components/ListLogo'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { SectionBreak } from 'components/swap/styleds'
import { ImportCoinList } from 'hooks/common/Coin'
import useTheme from 'hooks/useTheme'
import { transparentize } from 'polished'
import { useCallback, useState } from 'react'
import { AlertTriangle, ArrowLeft } from 'react-feather'
import { useAppDispatch } from 'state/hooks'
import { enableList, removeList } from 'state/lists/actions'
import styled from 'styled-components/macro'
import { CloseIcon, ThemedText } from 'theme'

import { ExternalLink } from '../../theme'
import { CoinModalView } from './CoinSearchModal'
import { Checkbox, PaddedColumn, TextDot } from './styleds'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: auto;
`

interface ImportProps {
  listURL: string
  list: ImportCoinList
  onDismiss: () => void
  setModalView: (view: CoinModalView) => void
}

export function ImportList({ listURL, list, setModalView, onDismiss }: ImportProps) {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  // user must accept
  const [confirmed, setConfirmed] = useState(false)

  // const lists = useAllLists()
  const lists = []
  // monitor is list is loading
  const adding = Boolean(lists[listURL]?.loadingRequestId)
  const [addError, setAddError] = useState<string | null>(null)

  return (
    <Wrapper>
      <PaddedColumn gap="14px" style={{ width: '100%', flex: '1 1' }}>
        <RowBetween>
          <ArrowLeft style={{ cursor: 'pointer' }} onClick={() => setModalView(CoinModalView.manage)} />
          <ThemedText.DeprecatedMediumHeader>
            <Trans>Import List</Trans>
          </ThemedText.DeprecatedMediumHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </PaddedColumn>
      <SectionBreak />
      <PaddedColumn gap="md">
        <AutoColumn gap="md">
          <Card backgroundColor={theme.deprecated_bg2} padding="12px 20px">
            <RowBetween>
              <RowFixed>
                {list.logoURL && <ListLogo logoURL={list.logoURL} size="40px" />}
                <AutoColumn gap="sm" style={{ marginLeft: '20px' }}>
                  <RowFixed>
                    <ThemedText.DeprecatedBody fontWeight={600} mr="6px">
                      {list.name}
                    </ThemedText.DeprecatedBody>
                    <TextDot />
                    <ThemedText.DeprecatedMain fontSize={'16px'} ml="6px">
                      <Trans>{list.coins.length} tokens</Trans>
                    </ThemedText.DeprecatedMain>
                  </RowFixed>
                  <ExternalLink href={`https://tokenlists.org/token-list?url=${listURL}`}>
                    <ThemedText.DeprecatedMain fontSize={'12px'} color={theme.deprecated_blue1}>
                      {listURL}
                    </ThemedText.DeprecatedMain>
                  </ExternalLink>
                </AutoColumn>
              </RowFixed>
            </RowBetween>
          </Card>
          <Card style={{ backgroundColor: transparentize(0.8, theme.deprecated_red1) }}>
            <AutoColumn justify="center" style={{ textAlign: 'center', gap: '16px', marginBottom: '12px' }}>
              <AlertTriangle stroke={theme.deprecated_red1} size={32} />
              <ThemedText.DeprecatedBody fontWeight={500} fontSize={20} color={theme.deprecated_red1}>
                <Trans>Import at your own risk</Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>

            <AutoColumn style={{ textAlign: 'center', gap: '16px', marginBottom: '12px' }}>
              <ThemedText.DeprecatedBody fontWeight={500} color={theme.deprecated_red1}>
                <Trans>
                  By adding this list you are implicitly trusting that the data is correct. Anyone can create a list,
                  including creating fake versions of existing lists and lists that claim to represent projects that do
                  not have one.
                </Trans>
              </ThemedText.DeprecatedBody>
              <ThemedText.DeprecatedBody fontWeight={600} color={theme.deprecated_red1}>
                <Trans>If you purchase a token from this list, you may not be able to sell it back.</Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
            <AutoRow justify="center" style={{ cursor: 'pointer' }} onClick={() => setConfirmed(!confirmed)}>
              <Checkbox
                name="confirmed"
                type="checkbox"
                checked={confirmed}
                onChange={() => setConfirmed(!confirmed)}
              />
              <ThemedText.DeprecatedBody ml="10px" fontSize="16px" color={theme.deprecated_red1} fontWeight={500}>
                <Trans>I understand</Trans>
              </ThemedText.DeprecatedBody>
            </AutoRow>
          </Card>

          <ButtonPrimary
            disabled={!confirmed}
            altDisabledStyle={true}
            $borderRadius="20px"
            padding="10px 1rem"
            onClick={() => {}}
          >
            <Trans>Import</Trans>
          </ButtonPrimary>
          {addError ? (
            <ThemedText.DeprecatedError title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} error>
              {addError}
            </ThemedText.DeprecatedError>
          ) : null}
        </AutoColumn>
        {/* </Card> */}
      </PaddedColumn>
    </Wrapper>
  )
}
