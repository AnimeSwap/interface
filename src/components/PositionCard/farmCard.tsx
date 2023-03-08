import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import { LoadingRows } from 'components/Loader'
import QuestionHelper from 'components/QuestionHelper'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { REFRESH_TIMEOUT } from 'constants/misc'
import { amountPretty, Coin, CoinAmount, useCoin } from 'hooks/common/Coin'
import { pairKey, PairState, useAniPrice, usePair } from 'hooks/common/Pair'
import { transparentize } from 'polished'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { SignAndSubmitTransaction, useAccount, useCoinAmount, useCoinBalance, useLpBalance } from 'state/wallets/hooks'
import styled from 'styled-components/macro'
import { formatDollarAmount } from 'utils/formatDollarAmt'

import { useColor } from '../../hooks/useColor'
import { ThemedText } from '../../theme'
import { ButtonGreen, ButtonPrimary, ButtonSecondary } from '../Button'
import { LightCard } from '../Card'
import CoinLogo from '../CoinLogo'
import Column, { AutoColumn } from '../Column'
import DoubleCoinLogo from '../DoubleLogo'
import { CardNoise } from '../earn/styled'
import { AutoRow, RowBetween, RowFixed } from '../Row'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: ${({ theme, bgColor }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.5, bgColor)} 0%, ${theme.deprecated_bg2} 100%) `};
  position: relative;
  overflow: hidden;
`

export enum FarmCardType {
  HOLDER = 'HOLDER',
  STAKE_ANI = 'STAKE_ANI',
  FARM_APT_ANI = 'FARM_APT_ANI',
  FARM_APT_zUSDC = 'FARM_APT_zUSDC',
}

export interface FarmCardProps {
  type?: FarmCardType
  coinX?: Coin
  coinY?: Coin
  poolLP?: Decimal
  poolCoinXAmount?: Decimal
  poolCoinYAmount?: Decimal
  stakedLP?: Decimal
  earnedANI?: Decimal
  LPAPR?: Decimal
  stakeAPR?: Decimal
  nativePrice?: Decimal
  withdrawFeeFreeTimestamp?: number
  shares?: number
  hasRegisteredANI?: boolean
  onRegisterANI?: any
}

export default function FarmCard(farmCardProps: FarmCardProps) {
  const {
    type,
    coinX,
    coinY,
    poolLP,
    poolCoinXAmount,
    poolCoinYAmount,
    stakedLP,
    earnedANI,
    LPAPR,
    stakeAPR,
    nativePrice,
    withdrawFeeFreeTimestamp,
    shares,
    hasRegisteredANI,
    onRegisterANI,
  } = farmCardProps
  const [tvlUSD, setTvlUSD] = useState<number>(0)
  const [availableUSD, setAvailableUSD] = useState<number>(0)
  const [stakedUSD, setStakedUSD] = useState<number>(0)
  const [earnedUSD, setEarnedUSD] = useState<number>(0)
  const [withdrawFeeFreeTimestampStr, setWithdrawFeeFreeTimestampStr] = useState<string>('-')

  const openStakeModal = useToggleModal(ApplicationModal.STAKE)
  const chainId = useChainId()
  const account = useAccount()
  const { nativeCoin, stableCoin } = getChainInfoOrDefault(chainId)
  const backgroundColor = useColor()
  const aniPrice = useAniPrice()
  const isFarm = coinY ? true : false
  const aniBalance = useCoinAmount(coinX?.address)
  const lpBalanceString = useLpBalance(pairKey(coinX?.address, coinY?.address))
  const lpBalance = Utils.d(lpBalanceString)
  const nativeCoinXPair = usePair(nativeCoin.address, coinX?.address)
  const nativeCoinYPair = usePair(nativeCoin.address, coinY?.address)

  const safeStakeAPR = stakeAPR?.toNumber() ?? 0
  const safeLPAPR = LPAPR?.toNumber() > 0 ? LPAPR?.toNumber() : 0
  // const safeLPAPY = (1 + safeLPAPR / 365) ** 365 - 1
  const safeStakeAPY = (1 + (safeStakeAPR + safeLPAPR) / 365) ** 365 - 1
  const showAPR =
    type === FarmCardType.STAKE_ANI || type === FarmCardType.FARM_APT_ANI || type === FarmCardType.FARM_APT_zUSDC
  const showAPY =
    type === FarmCardType.HOLDER ||
    (chainId === SupportedChainId.APTOS && type === FarmCardType.FARM_APT_ANI) ||
    (chainId === SupportedChainId.APTOS && type === FarmCardType.FARM_APT_zUSDC)
  const showHarvest =
    type === FarmCardType.STAKE_ANI || type === FarmCardType.FARM_APT_ANI || type === FarmCardType.FARM_APT_zUSDC
  const showRegisterANI = hasRegisteredANI === false && isFarm

  useEffect(() => {
    let usdAmount = Utils.d(0)
    if (coinX?.address === nativeCoin.address) {
      usdAmount = Utils.d(poolCoinXAmount)
        .mul(nativePrice)
        .mul(isFarm ? 2 : 1)
    } else if (coinY?.address === nativeCoin.address) {
      usdAmount = Utils.d(poolCoinYAmount)
        .mul(nativePrice)
        .mul(isFarm ? 2 : 1)
    } else if (nativeCoinXPair[0] === PairState.EXISTS) {
      const pair = nativeCoinXPair[1]
      usdAmount = Utils.d(pair.coinXReserve)
        .div(Utils.d(pair.coinYReserve))
        .mul(Utils.d(poolCoinXAmount))
        .mul(nativePrice)
        .mul(isFarm ? 2 : 1)
    } else if (nativeCoinYPair[0] === PairState.EXISTS) {
      const pair = nativeCoinYPair[1]
      usdAmount = Utils.d(pair.coinXReserve)
        .div(Utils.d(pair.coinYReserve))
        .mul(Utils.d(poolCoinYAmount))
        .mul(nativePrice)
        .mul(isFarm ? 2 : 1)
    }
    // TVL USD
    const usdNumber = usdAmount.div(Utils.pow10(stableCoin.decimals)).toNumber()
    setTvlUSD(usdNumber)
    if (isFarm) {
      setAvailableUSD(Utils.d(lpBalance).div(Utils.d(poolLP)).mul(usdNumber).toNumber())
    } else {
      setAvailableUSD(Utils.d(aniBalance.amount).div(Utils.d(poolLP)).mul(usdNumber).toNumber())
    }
    setStakedUSD(Utils.d(stakedLP).div(Utils.d(poolLP)).mul(usdNumber).toNumber())
    if (type === FarmCardType.FARM_APT_ANI) {
      setEarnedUSD(Utils.d(earnedANI).div(Utils.d(poolCoinYAmount)).div(2).mul(usdNumber).toNumber())
    } else if (type === FarmCardType.FARM_APT_zUSDC) {
      setEarnedUSD(Utils.d(earnedANI).mul(aniPrice).mul(1e-6).toNumber())
    } else if (type === FarmCardType.STAKE_ANI) {
      setEarnedUSD(Utils.d(earnedANI).div(Utils.d(poolLP)).mul(usdNumber).toNumber())
    }
  }, [coinX, coinY, poolCoinXAmount, poolCoinYAmount, poolLP, stakedLP, earnedANI, nativePrice])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setTxHash('')
  }, [txHash])

  useEffect(() => {
    if (type === FarmCardType.HOLDER && withdrawFeeFreeTimestamp) {
      const interval = setInterval(() => {
        const delta = (withdrawFeeFreeTimestamp - Date.now()) / 1000
        if (delta > 0) {
          const days = Math.floor(delta / 86400)
          const daysStr = days > 0 ? `${days}d:` : ''
          const hours = Math.floor((delta % 86400) / 3600)
          const hoursStr = hours > 0 ? `${('0' + hours).slice(-2)}h:` : ''
          const minutes = Math.floor((delta % 3600) / 60)
          const minutesStr = minutes > 0 ? `${('0' + minutes).slice(-2)}m:` : ''
          const seconds = '0' + Math.floor(delta % 60)
          const secondsStr = `${seconds.slice(-2)}s`
          setWithdrawFeeFreeTimestampStr(`${daysStr}${hoursStr}${minutesStr}${secondsStr}`)
        } else {
          setWithdrawFeeFreeTimestampStr('-')
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [withdrawFeeFreeTimestamp])

  async function onHarvest() {
    try {
      const payload =
        type === FarmCardType.FARM_APT_ANI
          ? ConnectionInstance.getSDK().MasterChef.stakeLPCoinPayload({
              amount: '0',
              coinType:
                '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin,0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI>',
              method: 'deposit',
            })
          : type === FarmCardType.FARM_APT_zUSDC
          ? ConnectionInstance.getSDK().MasterChef.stakeLPCoinPayload({
              amount: '0',
              coinType:
                '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin,0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
              method: 'deposit',
            })
          : ConnectionInstance.getSDK().MasterChef.stakeANIPayload({
              amount: '0',
              method: 'enter_staking',
            })
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

  return (
    <StyledPositionCard bgColor={backgroundColor} maxWidth={'340px'} width={'100%'}>
      {/* <CardNoise /> */}
      {stakeAPR ? (
        <AutoColumn gap="12px">
          <FixedHeightRow style={{ marginBottom: '8px' }}>
            {type === FarmCardType.HOLDER && (
              <AutoRow gap="4px" style={{ marginLeft: '0px' }}>
                <CoinLogo coin={coinX} size={'30px'} />
                <Text fontWeight={500} fontSize={20}>
                  Holder Pool
                </Text>
                <QuestionHelper
                  text={`Any ANI tokens you stake in this pool will be automatically harvested and compounded for you after anyone stake or unstake.`}
                />
                <ThemedText.DeprecatedMain fontSize={14}>Auto-Compound</ThemedText.DeprecatedMain>
              </AutoRow>
            )}
            {type === FarmCardType.STAKE_ANI && (
              <AutoRow gap="8px" style={{ marginLeft: '0px' }}>
                <CoinLogo coin={coinX} size={'30px'} />
                <Text fontWeight={500} fontSize={20}>
                  Stake {coinX?.symbol}
                </Text>
              </AutoRow>
            )}
            {type === FarmCardType.FARM_APT_ANI && (
              <AutoRow gap="8px" style={{ marginLeft: '4px' }}>
                <DoubleCoinLogo coinX={coinX} coinY={coinY} size={30} margin={false} />
                <Text fontWeight={500} fontSize={20}>
                  {`${coinX?.symbol}-${coinY?.symbol}`}
                </Text>
              </AutoRow>
            )}
            {type === FarmCardType.FARM_APT_zUSDC && (
              <AutoRow gap="8px" style={{ marginLeft: '4px' }}>
                <DoubleCoinLogo coinX={coinX} coinY={coinY} size={30} margin={false} />
                <Text fontWeight={500} fontSize={20}>
                  {`${coinX?.symbol}-${coinY?.symbol}`}
                </Text>
              </AutoRow>
            )}
          </FixedHeightRow>

          <AutoColumn gap="16px">
            <FixedHeightRow>
              {showAPR && (
                <RowFixed>
                  <ThemedText.DeprecatedMain fontSize={14}>APR</ThemedText.DeprecatedMain>
                  <Text fontSize={16} fontWeight={500} style={{ paddingLeft: '6px' }}>
                    {((safeStakeAPR + safeLPAPR) * 100).toFixed(2)}%
                  </Text>
                  {isFarm && (
                    <QuestionHelper
                      text={`Liquidity providers ${(safeLPAPR * 100).toFixed(2)}% and the rewards in ANI ${(
                        safeStakeAPR * 100
                      ).toFixed(2)}%`}
                    />
                  )}
                </RowFixed>
              )}
              {showAPY && (
                <RowFixed>
                  <ThemedText.DeprecatedMain fontSize={14}>APY</ThemedText.DeprecatedMain>
                  <Text fontSize={16} fontWeight={500} style={{ paddingLeft: '6px' }}>
                    {(safeStakeAPY * 100).toFixed(2)}%
                  </Text>
                  {type === FarmCardType.HOLDER && (
                    <QuestionHelper text={`Holder pool is compounded automatically, so we show APY.`} />
                  )}
                  {type === FarmCardType.FARM_APT_ANI && (
                    <QuestionHelper
                      text={`APY is based on your one-year income if Harvest and Compound are made once a day. Provided APY calculations depend on current APR rates.`}
                    />
                  )}
                </RowFixed>
              )}
              {!isFarm && (
                <RowFixed>
                  <ThemedText.DeprecatedMain fontSize={14}>TVL</ThemedText.DeprecatedMain>
                  <Text fontSize={16} fontWeight={500} style={{ paddingLeft: '6px' }}>
                    {formatDollarAmount(tvlUSD)}
                  </Text>
                </RowFixed>
              )}
            </FixedHeightRow>
            {isFarm && (
              <FixedHeightRow>
                <ThemedText.DeprecatedMain fontSize={14}>TVL</ThemedText.DeprecatedMain>
                <Text fontSize={16} fontWeight={500} style={{ paddingLeft: '6px' }}>
                  {formatDollarAmount(tvlUSD)}
                </Text>
              </FixedHeightRow>
            )}
            <FixedHeightRow>
              <ThemedText.DeprecatedMain fontSize={16}>
                Available {isFarm ? 'LP' : coinX?.symbol}
              </ThemedText.DeprecatedMain>
              <Column style={{ alignItems: 'flex-end' }}>
                <Text fontSize={16} fontWeight={500}>
                  {isFarm ? amountPretty(lpBalance, 8, 6) : aniBalance?.pretty(6)}
                </Text>
                {availableUSD > 0 && (
                  <ThemedText.DeprecatedMain fontSize={10} style={{ paddingLeft: '6px' }}>
                    {formatDollarAmount(availableUSD)}
                  </ThemedText.DeprecatedMain>
                )}
              </Column>
            </FixedHeightRow>
            <FixedHeightRow>
              <ThemedText.DeprecatedMain fontSize={16}>
                Staked {isFarm ? 'LP' : coinX?.symbol}
              </ThemedText.DeprecatedMain>
              <Column style={{ alignItems: 'flex-end' }}>
                <Text fontSize={16} fontWeight={500}>
                  {amountPretty(stakedLP, 8, 6)}
                </Text>
                {stakedUSD > 0 && (
                  <ThemedText.DeprecatedMain fontSize={10} style={{ paddingLeft: '6px' }}>
                    {formatDollarAmount(stakedUSD)}
                  </ThemedText.DeprecatedMain>
                )}
              </Column>
            </FixedHeightRow>
            <FixedHeightRow>
              <RowFixed>
                <ThemedText.DeprecatedMain fontSize={16}>Earned ANI</ThemedText.DeprecatedMain>
                <QuestionHelper text={`Earned since your last action. Staked ANI include Earned ANI.`} />
              </RowFixed>
              <Column style={{ alignItems: 'flex-end' }}>
                <Text fontSize={16} fontWeight={500}>
                  {amountPretty(earnedANI, 8, 6)}
                </Text>
                {earnedUSD > 0 && (
                  <ThemedText.DeprecatedMain fontSize={10} style={{ paddingLeft: '6px' }}>
                    {formatDollarAmount(earnedUSD)}
                  </ThemedText.DeprecatedMain>
                )}
              </Column>
            </FixedHeightRow>
            {type === FarmCardType.HOLDER && (
              <FixedHeightRow>
                <RowFixed>
                  <ThemedText.DeprecatedMain fontSize={14}>20% unstaking fee until</ThemedText.DeprecatedMain>
                  <QuestionHelper
                    text={`Only applies within 30 days of staking. Unstaking after 30 days will not include a fee. Timer resets every time you stake new ANI in the pool.`}
                  />
                </RowFixed>
                <Column style={{ alignItems: 'flex-end' }}>
                  <ThemedText.DeprecatedMain fontSize={14} fontWeight={500}>
                    {withdrawFeeFreeTimestampStr}
                  </ThemedText.DeprecatedMain>
                </Column>
              </FixedHeightRow>
            )}
            <RowBetween marginTop="10px">
              {(!isFarm || !showRegisterANI) && (
                <ButtonPrimary
                  padding="8px"
                  $borderRadius="8px"
                  onClick={() => {
                    window.farmCardProps = farmCardProps
                    window.farmCardBalance = isFarm ? lpBalance : aniBalance.amount
                    window.farmCardAction = 'stake'
                    openStakeModal()
                  }}
                >
                  Stake
                </ButtonPrimary>
              )}
              {stakedLP?.toNumber() > 0 && !showRegisterANI && (
                <ButtonPrimary
                  padding="8px"
                  margin="0 0 0 16px"
                  $borderRadius="8px"
                  onClick={() => {
                    window.farmCardProps = farmCardProps
                    window.farmCardBalance = stakedLP
                    window.farmCardAction = 'unstake'
                    window.shares = shares
                    openStakeModal()
                  }}
                >
                  Unstake
                </ButtonPrimary>
              )}
              {showRegisterANI && (
                <ButtonGreen
                  padding="8px"
                  margin="0 0 0 0px"
                  $borderRadius="8px"
                  onClick={() => {
                    onRegisterANI()
                  }}
                >
                  Register ANI
                </ButtonGreen>
              )}
            </RowBetween>
            <RowBetween marginTop="0px">
              <ButtonSecondary
                padding="8px"
                $borderRadius="8px"
                as={Link}
                to={isFarm ? `/add/${coinX?.address}/${coinY?.address}` : '/'}
              >
                Get {isFarm ? 'LP' : 'ANI'}
              </ButtonSecondary>
              {showHarvest && !showRegisterANI && stakedLP?.toNumber() > 0 && (
                <ButtonGreen
                  padding="8px"
                  margin="0 0 0 16px"
                  $borderRadius="8px"
                  onClick={() => {
                    onHarvest()
                  }}
                >
                  Harvest
                </ButtonGreen>
              )}
            </RowBetween>
          </AutoColumn>
        </AutoColumn>
      ) : (
        <LoadingRows>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </LoadingRows>
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
    </StyledPositionCard>
  )
}
