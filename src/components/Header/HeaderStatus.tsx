// eslint-disable-next-line no-restricted-imports
import { Trans } from '@lingui/macro'
// import { getIsValidSwapQuote } from 'pages/Swap'
import { darken } from 'polished'
import { useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import { useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'
import { useAccount, useWallet } from 'state/wallets/hooks'
// import { useDerivedSwapInfo } from 'state/swap/hooks'
import styled, { css } from 'styled-components/macro'

import { useToggleWalletModal } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/types'
import { shortenAddress } from '../../utils'
import { ButtonSecondary } from '../Button'
import Loader from '../Loader'
import { RowBetween } from '../Row'
import WalletModal from '../WalletModal'

const StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 14px;
  cursor: pointer;
  user-select: none;
  height: 36px;
  margin-right: 2px;
  margin-left: 2px;
  :focus {
    outline: none;
  }
`
const StatusError = styled(StatusGeneric)`
  background-color: ${({ theme }) => theme.deprecated_red1};
  border: 1px solid ${({ theme }) => theme.deprecated_red1};
  color: ${({ theme }) => theme.deprecated_white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.deprecated_red1)};
  }
`

const StatusConnect = styled(StatusGeneric)<{ faded?: boolean }>`
  background-color: ${({ theme }) => theme.deprecated_primary4};
  border: none;

  color: ${({ theme }) => theme.deprecated_primaryText1};
  font-weight: 500;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.deprecated_primary4)};
    color: ${({ theme }) => theme.deprecated_primaryText1};
  }

  ${({ faded }) =>
    faded &&
    css`
      background-color: ${({ theme }) => theme.deprecated_primary5};
      border: 1px solid ${({ theme }) => theme.deprecated_primary5};
      color: ${({ theme }) => theme.deprecated_primaryText1};

      :hover,
      :focus {
        border: 1px solid ${({ theme }) => darken(0.05, theme.deprecated_primary4)};
        color: ${({ theme }) => darken(0.05, theme.deprecated_primaryText1)};
      }
    `}
`

const StatusConnected = styled(StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.deprecated_primary1 : theme.deprecated_bg1)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.deprecated_primary1 : theme.deprecated_bg1)};
  color: ${({ pending, theme }) => (pending ? theme.deprecated_white : theme.deprecated_text1)};
  font-weight: 500;
  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.deprecated_bg3)};

    :focus {
      border: 1px solid
        ${({ pending, theme }) =>
          pending ? darken(0.1, theme.deprecated_primary1) : darken(0.1, theme.deprecated_bg2)};
    }
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(AlertTriangle)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

function StatusInner() {
  const account = useAccount()
  const chainId = useChainId()
  // const {
  //   trade: { state: tradeState, trade },
  //   inputError: swapInputError,
  // } = useDerivedSwapInfo()
  // const validSwapQuote = getIsValidSwapQuote(trade, tradeState, swapInputError)

  const error = useAppSelector((state) => state.connection.error[chainId])

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

  const hasPendingTransactions = !!pending.length
  const toggleWalletModal = useToggleWalletModal()

  if (!chainId) {
    return null
  } else if (error) {
    return (
      <StatusError onClick={toggleWalletModal}>
        <NetworkIcon />
        <Text>
          <Trans>Error</Trans>
        </Text>
      </StatusError>
    )
  } else if (account) {
    return (
      <StatusConnected data-testid="status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>
              <Trans>{pending?.length} Pending</Trans>
            </Text>{' '}
            <Loader stroke="white" />
          </RowBetween>
        ) : (
          <Text>{shortenAddress(account)}</Text>
        )}
      </StatusConnected>
    )
  } else {
    return (
      <StatusConnect onClick={toggleWalletModal} faded={!account}>
        <Text>
          <Trans>Connect Wallet</Trans>
        </Text>
      </StatusConnect>
    )
  }
}

export default function HeaderStatus() {
  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

  return (
    <>
      <StatusInner />
      <WalletModal pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
}
