import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { Input } from '@rebass/forms'
import { FarmCardProps, FarmCardType } from 'components/PositionCard/farmCard'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { SupportedChainId } from 'constants/chains'
import { REFRESH_TIMEOUT } from 'constants/misc'
import { amountPretty } from 'hooks/common/Coin'
import { useCallback, useEffect, useState } from 'react'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { SignAndSubmitTransaction, useAccount } from 'state/wallets/hooks'
import styled from 'styled-components/macro'

import { CloseIcon, ExternalLink, ThemedText } from '../../theme'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { ButtonPrimary, ButtonSecondary } from '../Button'
import { AutoColumn } from '../Column'
import { Break, CardSection, DataCard } from '../earn/styled'
import { CardBGImage, CardNoise } from '../earn/styled'
import Modal from '../Modal'
import { AutoRow, RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #021d43 100%);
`

const ConfirmOrLoadingWrapper = styled.div<{ activeBG: boolean }>`
  width: 100%;
  padding: 24px;
  position: relative;
  background: ${({ activeBG }) =>
    activeBG &&
    'radial-gradient(76.02% 75.41% at 1.84% 0%, rgba(255, 0, 122, 0.2) 0%, rgba(33, 114, 229, 0.2) 100%), #FFFFFF;'};
`

export default function StakeModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const account = useAccount()
  const chainId = useChainId()

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')

  const [inputValue, setInputValue] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState<string>('')

  const farmCardProps: FarmCardProps = window.farmCardProps
  const balance: Decimal = window.farmCardBalance
  const action: string = window.farmCardAction
  const shares: number = window.shares
  const type = farmCardProps?.type
  const isFarm = farmCardProps?.coinY ? true : false

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      wrappedOnDismiss()
      setInputValue('')
      setAmount(0)
      setError('')
    }
    setTxHash('')
  }, [txHash])

  async function onConfirm() {
    try {
      let payload
      if (type === FarmCardType.HOLDER) {
        if (action === 'stake') {
          payload = ConnectionInstance.getSDK().Misc.autoAniDepositPayload(amount.toString())
        } else {
          let withdrawShares = Utils.d(amount).mul(shares).div(balance).ceil()
          if (withdrawShares.gt(shares)) {
            withdrawShares = Utils.d(shares)
          }
          payload = ConnectionInstance.getSDK().Misc.autoAniWithdrawPayload(withdrawShares)
        }
      } else if (type === FarmCardType.STAKE_ANI) {
        payload = ConnectionInstance.getSDK().MasterChef.stakeANIPayload({
          amount: amount.toString(),
          method: action === 'stake' ? 'enter_staking' : 'leave_staking',
        })
      } else if (type === FarmCardType.FARM_APT_ANI) {
        payload = ConnectionInstance.getSDK().MasterChef.stakeLPCoinPayload({
          amount: amount.toString(),
          coinType:
            '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin,0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI>',
          method: action === 'stake' ? 'deposit' : 'withdraw',
        })
      } else if (type === FarmCardType.FARM_APT_zUSDC) {
        payload = ConnectionInstance.getSDK().MasterChef.stakeLPCoinPayload({
          amount: amount.toString(),
          coinType:
            '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin,0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
          method: action === 'stake' ? 'deposit' : 'withdraw',
        })
      }
      setShowConfirm(true)
      setAttemptingTxn(true)
      const txid = await SignAndSubmitTransaction(chainId, payload)
      setAttemptingTxn(false)
      setTxHash(txid)
      setTimeout(() => {
        ConnectionInstance.syncAccountResources(account, chainId, false)
        setTimeout(() => {
          ConnectionInstance.syncAccountResources(account, chainId, false)
        }, REFRESH_TIMEOUT * 2)
      }, REFRESH_TIMEOUT)
    } catch (e) {
      setAttemptingTxn(false)
      setShowConfirm(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setAmount(0)
      setError('')
    }
  }, [isOpen])

  function wrappedOnDismiss() {
    setAttemptingTxn(false)
    setTxHash(undefined)
    onDismiss()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attemptingTxn && !txHash && (
        <ContentWrapper gap="lg">
          <ModalUpper>
            <CardBGImage />
            <CardNoise />
            <CardSection gap="md">
              <RowBetween>
                <ThemedText.DeprecatedWhite fontWeight={500}>
                  {(action === 'stake' ? 'Stake ' : 'Unstake ') + (isFarm ? 'LP tokens' : 'ANI')}
                </ThemedText.DeprecatedWhite>
                <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="white" />
              </RowBetween>
            </CardSection>
            <Break />
          </ModalUpper>
          <AutoColumn gap="md" style={{ paddingLeft: '2rem', paddingRight: '2rem' }} justify="start">
            <RowBetween>
              <ThemedText.DeprecatedMain>Stake</ThemedText.DeprecatedMain>
              <ThemedText.DeprecatedMain>Balance: {amountPretty(balance, 8, 8)}</ThemedText.DeprecatedMain>
            </RowBetween>
            <RowBetween>
              <Input
                id="amount"
                name="amount"
                placeholder="0"
                width={'75%'}
                onChange={(v) => {
                  const value = v.target.value
                  if (/^\d*\.?\d*$/.test(value)) {
                    setInputValue(v.target.value)
                    try {
                      const amount = Utils.d(value).mul(Utils.pow10(8))
                      if (amount.gt(balance)) {
                        setError('Insufficient balance')
                      } else {
                        setError('')
                      }
                      setAmount(amount.toNumber())
                    } catch (e) {
                      setError('')
                      setAmount(0)
                    }
                  }
                }}
                value={inputValue}
              />
              <ButtonPrimary
                width={'20%'}
                maxWidth="100px"
                fontSize={'4px'}
                padding="0.75rem"
                onClick={() => {
                  setInputValue(balance.div(Utils.pow10(8)).toString())
                  setAmount(balance.toNumber())
                }}
              >
                MAX
              </ButtonPrimary>
            </RowBetween>
            {error !== '' && <ThemedText.DeprecatedError error={true}>{error}</ThemedText.DeprecatedError>}
            {amount <= 0 && <ThemedText.DeprecatedError error={true}>{'Input empty'}</ThemedText.DeprecatedError>}
          </AutoColumn>
          <AutoRow style={{ padding: '1rem', paddingTop: '0' }} justify="center">
            <ButtonSecondary
              disabled={false}
              padding="12px 12px"
              marginRight={'1rem'}
              width="44%"
              $borderRadius="12px"
              mt="1rem"
              onClick={wrappedOnDismiss}
            >
              Cancel
            </ButtonSecondary>
            <ButtonPrimary
              disabled={amount <= 0 || error !== ''}
              padding="12px 12px"
              width="44%"
              $borderRadius="12px"
              mt="1rem"
              onClick={() => {
                onConfirm()
              }}
            >
              Confirm
            </ButtonPrimary>
          </AutoRow>
          <AutoColumn gap="md" style={{ paddingTop: '0', paddingBottom: '2rem' }} justify="center">
            {action === 'stake' && (
              <ExternalLink
                href={isFarm ? `/add/${farmCardProps?.coinX?.address}/${farmCardProps?.coinY?.address}` : '/'}
              >
                Get {isFarm ? `${farmCardProps?.coinX?.symbol}-${farmCardProps?.coinY?.symbol}` : 'ANI'}
                <sup>↗</sup>
              </ExternalLink>
            )}
          </AutoColumn>
        </ContentWrapper>
      )}
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => {
          return <></>
        }}
        pendingText={''}
      />
    </Modal>
  )
}
