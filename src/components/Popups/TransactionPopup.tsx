import { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import { useChainId } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components/macro'

import { useTransaction } from '../../state/transactions/hooks'
import { ThemedText } from '../../theme'
import { ExternalLink } from '../../theme'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { TransactionSummary } from '../AccountDetails/TransactionSummary'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function TransactionPopup({ hash }: { hash: string }) {
  const chainId = useChainId()

  const tx = useTransaction(hash)
  const theme = useContext(ThemeContext)

  if (!tx) return null
  const success = Boolean(tx.receipt && tx.receipt.status === 1)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? (
          <CheckCircle color={theme.deprecated_green1} size={24} />
        ) : (
          <AlertCircle color={theme.deprecated_red1} size={24} />
        )}
      </div>
      <AutoColumn gap="8px">
        <ThemedText.DeprecatedBody fontWeight={500}>
          <TransactionSummary info={tx.info} />
        </ThemedText.DeprecatedBody>
        {chainId && (
          <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
            View on Explorer
          </ExternalLink>
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
