import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'

import {
  AddLiquidityV2PoolTransactionInfo,
  DepositLiquidityStakingTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  ExecuteTransactionInfo,
  QueueTransactionInfo,
  SubmitProposalTransactionInfo,
  TransactionInfo,
  TransactionType,
  WithdrawLiquidityStakingTransactionInfo,
} from '../../state/transactions/types'

function formatAmount(amountRaw: string, decimals: number, sigFigs: number): string {
  return Utils.d(amountRaw).mul(new Decimal(10).pow(-decimals)).toSD(sigFigs).toString()
}

function FormattedCoinAmount({
  rawAmount,
  symbol,
  decimals,
  sigFigs,
}: {
  rawAmount: string
  symbol: string
  decimals: number
  sigFigs: number
}) {
  return (
    <>
      {formatAmount(rawAmount, decimals, sigFigs)} {symbol}
    </>
  )
}

function FormattedCoinAmountManaged({
  rawAmount,
  coinId,
  sigFigs = 6,
}: {
  rawAmount: string
  coinId: string
  sigFigs: number
}) {
  // const currency = useCurrency(coinId)
  // return currency ? (
  //   <FormattedCoinAmount
  //     rawAmount={rawAmount}
  //     decimals={currency.decimals}
  //     sigFigs={sigFigs}
  //     symbol={currency.symbol ?? '???'}
  //   />
  // ) : null
  return null
}

function SubmitProposalTransactionSummary(_: { info: SubmitProposalTransactionInfo }) {
  return <Trans>Submit new proposal</Trans>
}

function QueueSummary({ info }: { info: QueueTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`
  return <Trans>Queue proposal {proposalKey}.</Trans>
}

function ExecuteSummary({ info }: { info: ExecuteTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`
  return <Trans>Execute proposal {proposalKey}.</Trans>
}

function DepositLiquidityStakingSummary(_: { info: DepositLiquidityStakingTransactionInfo }) {
  // not worth rendering the tokens since you can should no longer deposit liquidity in the staking contracts
  // todo: deprecate and delete the code paths that allow this, show user more information
  return <Trans>Deposit liquidity</Trans>
}

function WithdrawLiquidityStakingSummary(_: { info: WithdrawLiquidityStakingTransactionInfo }) {
  return <Trans>Withdraw deposited liquidity</Trans>
}

function AddLiquidityV2PoolSummary({
  info: { quoteCoinId, expectedAmountBaseRaw, expectedAmountQuoteRaw, baseCoinId },
}: {
  info: AddLiquidityV2PoolTransactionInfo
}) {
  return (
    <Trans>
      Add <FormattedCoinAmountManaged rawAmount={expectedAmountBaseRaw} coinId={baseCoinId} sigFigs={3} /> and{' '}
      <FormattedCoinAmountManaged rawAmount={expectedAmountQuoteRaw} coinId={quoteCoinId} sigFigs={3} /> to Uniswap V2
    </Trans>
  )
}

function SwapSummary({ info }: { info: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo }) {
  // TODO[Azard] replace with v1-sdk
  return <></>
  // if (info.tradeType === TradeType.EXACT_INPUT) {
  //   return (
  //     <Trans>
  //       Swap exactly{' '}
  //       <FormattedCoinAmountManaged
  //         rawAmount={info.inputCoinAmountRaw}
  //         coinId={info.inputCoinId}
  //         sigFigs={6}
  //       />{' '}
  //       for{' '}
  //       <FormattedCoinAmountManaged
  //         rawAmount={info.expectedoutputCoinAmountRaw}
  //         coinId={info.outputCoinId}
  //         sigFigs={6}
  //       />
  //     </Trans>
  //   )
  // } else {
  //   return (
  //     <Trans>
  //       Swap{' '}
  //       <FormattedCoinAmountManaged
  //         rawAmount={info.expectedinputCoinAmountRaw}
  //         coinId={info.inputCoinId}
  //         sigFigs={6}
  //       />{' '}
  //       for exactly{' '}
  //       <FormattedCoinAmountManaged
  //         rawAmount={info.outputCoinAmountRaw}
  //         coinId={info.outputCoinId}
  //         sigFigs={6}
  //       />
  //     </Trans>
  //   )
  // }
}

export function TransactionSummary({ info }: { info: TransactionInfo }) {
  switch (info.type) {
    case TransactionType.ADD_LIQUIDITY_V2_POOL:
      return <AddLiquidityV2PoolSummary info={info} />

    case TransactionType.DEPOSIT_LIQUIDITY_STAKING:
      return <DepositLiquidityStakingSummary info={info} />

    case TransactionType.WITHDRAW_LIQUIDITY_STAKING:
      return <WithdrawLiquidityStakingSummary info={info} />

    case TransactionType.SWAP:
      return <SwapSummary info={info} />

    case TransactionType.QUEUE:
      return <QueueSummary info={info} />

    case TransactionType.EXECUTE:
      return <ExecuteSummary info={info} />

    case TransactionType.SUBMIT_PROPOSAL:
      return <SubmitProposalTransactionSummary info={info} />
  }
}
