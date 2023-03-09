import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { StakedLPInfo, UserInfoReturn } from '@animeswap.org/v1-sdk/dist/tsc/modules/MasterChefModule'
import { Trans } from '@lingui/macro'
import FarmCard, { FarmCardProps, FarmCardType } from 'components/PositionCard/farmCard'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { isSuiChain, SupportedChainId } from 'constants/chains'
import { REFRESH_TIMEOUT } from 'constants/misc'
import { useCoin } from 'hooks/common/Coin'
import { Pair, pairKey, useNativePrice } from 'hooks/common/Pair'
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { SignAndSubmitTransaction, useAccount, useAllLpBalance } from 'state/wallets/hooks'
import styled, { ThemeContext } from 'styled-components/macro'
import { isDevelopmentEnv } from 'utils/env'

import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import Card from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import FullPositionCard from '../../components/PositionCard'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { Dots } from '../../components/swap/styleds'
import { ExternalLink, HideSmall, ThemedText } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  max-width: 740px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  border-radius: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.deprecated_text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const account = useAccount()
  const chainId = useChainId()
  const nativePrice = useNativePrice()
  const allLpBalances = useAllLpBalance()

  const [pairTasksLoading, setPairTasksLoading] = useState<boolean>(true)
  const [pairs, setPairs] = useState<Pair[]>([])

  const showFarm = [SupportedChainId.APTOS_DEVNET, SupportedChainId.APTOS_TESTNET, SupportedChainId.APTOS].includes(
    chainId
  )

  const pairKeyNotZero: string[] = []
  for (const pairKey in allLpBalances) {
    if (allLpBalances[pairKey] !== '0') {
      pairKeyNotZero.push(pairKey)
    }
  }

  // your LP
  useEffect(() => {
    const fetchPairTasks = async () => {
      const pairTasksPromise: Promise<Pair>[] = []
      for (const pairKey of pairKeyNotZero) {
        const [coinX, coinY] = pairKey.split(', ')
        if (!coinX || !coinY) continue
        pairTasksPromise.push(ConnectionInstance.getPair(coinX, coinY))
      }
      const pairResults = await Promise.all(pairTasksPromise)
      setPairTasksLoading(false)
      setPairs(pairResults)
    }
    fetchPairTasks()
  }, [account, allLpBalances])

  const { aniCoin, nativeCoin, zUSDC } = getChainInfoOrDefault(chainId)
  const [aniPool, setAniPool] = useState<FarmCardProps>({})
  const [aptAniPool, setAptAniPool] = useState<FarmCardProps>({})
  const [aptAniLPAPR, setAptAniLPAPR] = useState<Decimal>(Utils.d(0))
  const [aptZUSDCPool, setAptZUSDCPool] = useState<FarmCardProps>({})
  const [aptZUSDCLPAPR, setAptZUSDCLPAPR] = useState<Decimal>(Utils.d(0))
  const [holderPool, setHolderPool] = useState<FarmCardProps>({})
  const [hasRegisteredANI, setHasRegisteredANI] = useState<boolean>(true)
  const [count, setCount] = useState(0)

  // Farm data interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((count) => count + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Farm data
  useEffect(() => {
    const fetchStake = async () => {
      if (!showFarm) return
      let res = new Map()
      try {
        if (account) {
          // @ts-ignore
          res = await ConnectionInstance.getSDK().MasterChef.getUserInfoAll(account)
        } else {
          res = new Map()
        }
      } catch (e) {
        res = new Map()
        console.log(e)
      }
      let res4
      try {
        if (account) {
          // @ts-ignore
          res4 = await ConnectionInstance.getSDK().Misc.calculateAutoAniStakedAmount(account)
        } else {
          res4 = undefined
        }
      } catch (e) {
        res4 = undefined
        console.log(e)
      }
      const taskListCommon = [
        ConnectionInstance.getSDK().MasterChef.getFirstTwoPairStakedLPInfo(),
        ConnectionInstance.getSDK().Misc.calculateAutoAniInfo(),
      ]
      const [res2, res3] = await Promise.all(taskListCommon)
      setAniPool({
        poolLP: res2[0]?.lpAmount,
        poolCoinXAmount: res2[0]?.lpAmount,
        // @ts-ignore
        stakedLP: res.get(aniCoin?.address)?.amount,
        stakeAPR: res2[0]?.apr,
        // @ts-ignore
        earnedANI: res.get(aniCoin?.address)?.pendingAni,
      })
      setAptAniPool({
        poolLP: res2[1]?.lpAmount,
        poolCoinXAmount: res2[1]?.coinX,
        poolCoinYAmount: res2[1]?.coinY,
        // @ts-ignore
        stakedLP: res.get(
          '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI>'
        )?.amount,
        stakeAPR: res2[1]?.apr,
        // @ts-ignore
        earnedANI: res.get(
          '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI>'
        )?.pendingAni,
      })
      if (chainId === SupportedChainId.APTOS) {
        setAptZUSDCPool({
          poolLP: res2[2]?.lpAmount,
          poolCoinXAmount: res2[2]?.coinX,
          poolCoinYAmount: res2[2]?.coinY,
          // @ts-ignore
          stakedLP: res.get(
            '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>'
          )?.amount,
          stakeAPR: res2[2]?.apr,
          // @ts-ignore
          earnedANI: res.get(
            '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf::LPCoinV1::LPCoin<0x1::aptos_coin::AptosCoin, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>'
          )?.pendingAni,
        })
      }
      setHolderPool({
        // @ts-ignore
        poolLP: res3?.amount,
        // @ts-ignore
        poolCoinXAmount: res3?.amount,
        // @ts-ignore
        stakedLP: res4?.amount,
        stakeAPR: res2[0]?.apr,
        // @ts-ignore
        earnedANI: Number.isNaN(res4?.amount - res4?.lastUserActionAni) ? 0 : res4?.amount - res4?.lastUserActionAni,
        withdrawFeeFreeTimestamp: Utils.d(res4?.withdrawFeeFreeTimestamp).mul(1e3).toNumber(),
        shares: Utils.d(res4?.shares).toNumber(),
      })
    }
    fetchStake()
  }, [chainId, account, allLpBalances, count])

  // LP APR
  useEffect(() => {
    const fetchLPAPR = async () => {
      const ret = await ConnectionInstance.getSDK().swap.getLPCoinAPY(
        {
          coinX: nativeCoin.address,
          coinY: aniCoin.address,
        },
        Utils.d(1e6)
      )
      setAptAniLPAPR(Utils.d(ret?.apy))
      if (chainId === SupportedChainId.APTOS) {
        const ret = await ConnectionInstance.getSDK().swap.getLPCoinAPY(
          {
            coinX: nativeCoin.address,
            coinY: zUSDC.address,
          },
          Utils.d(1e6)
        )
        setAptZUSDCLPAPR(Utils.d(ret?.apy))
      }
    }
    fetchLPAPR()
  }, [chainId])

  async function checkRegisteredANI() {
    const registeredANI = await ConnectionInstance.getSDK().MasterChef.checkRegisteredANI(account)
    setHasRegisteredANI(registeredANI)
  }

  // check ANI register
  useEffect(() => {
    checkRegisteredANI()
  }, [chainId, account])

  async function onRegisterANI() {
    const payload = ConnectionInstance.getSDK().MasterChef.registerANIPayload()
    await SignAndSubmitTransaction(chainId, payload)
    setTimeout(() => {
      checkRegisteredANI()
      setTimeout(() => {
        checkRegisteredANI()
      }, REFRESH_TIMEOUT * 2)
    }, REFRESH_TIMEOUT)
  }

  if (isSuiChain(chainId)) {
    return (
      <>
        <PageWrapper>
          <center>Sui Pool Coming Soon...</center>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <PageWrapper>
        {showFarm && (
          <AutoColumn gap="lg" justify="center" style={{ marginBottom: '2rem' }}>
            <AutoColumn gap="md" style={{ width: '100%' }}>
              <TitleRow style={{ marginTop: '0.5rem' }} padding={'0'}>
                <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0rem', justifySelf: 'flex-start' }}>
                  Stake and Farms
                </ThemedText.DeprecatedMediumHeader>
              </TitleRow>
              <AutoRow gap="8px" justify="start" align="start">
                <FarmCard
                  type={FarmCardType.HOLDER}
                  coinX={aniCoin}
                  poolLP={holderPool.poolLP}
                  poolCoinXAmount={holderPool.poolCoinXAmount}
                  stakedLP={holderPool.stakedLP}
                  earnedANI={holderPool.earnedANI}
                  stakeAPR={holderPool.stakeAPR}
                  nativePrice={nativePrice}
                  withdrawFeeFreeTimestamp={holderPool.withdrawFeeFreeTimestamp}
                  shares={holderPool.shares}
                ></FarmCard>
                <FarmCard
                  type={FarmCardType.STAKE_ANI}
                  coinX={aniCoin}
                  poolLP={aniPool.poolLP}
                  poolCoinXAmount={aniPool.poolCoinXAmount}
                  stakedLP={aniPool.stakedLP}
                  earnedANI={aniPool.earnedANI}
                  stakeAPR={aniPool.stakeAPR}
                  nativePrice={nativePrice}
                ></FarmCard>
                <FarmCard
                  type={FarmCardType.FARM_APT_ANI}
                  coinX={nativeCoin}
                  coinY={aniCoin}
                  poolLP={aptAniPool.poolLP}
                  poolCoinXAmount={aptAniPool.poolCoinXAmount}
                  poolCoinYAmount={aptAniPool.poolCoinYAmount}
                  stakedLP={aptAniPool.stakedLP}
                  earnedANI={aptAniPool.earnedANI}
                  LPAPR={aptAniLPAPR}
                  stakeAPR={aptAniPool.stakeAPR}
                  nativePrice={nativePrice}
                  hasRegisteredANI={hasRegisteredANI}
                  onRegisterANI={onRegisterANI}
                ></FarmCard>
                {chainId === SupportedChainId.APTOS && (
                  <FarmCard
                    type={FarmCardType.FARM_APT_zUSDC}
                    coinX={nativeCoin}
                    coinY={zUSDC}
                    poolLP={aptZUSDCPool.poolLP}
                    poolCoinXAmount={aptZUSDCPool.poolCoinXAmount}
                    poolCoinYAmount={aptZUSDCPool.poolCoinYAmount}
                    stakedLP={aptZUSDCPool.stakedLP}
                    earnedANI={aptZUSDCPool.earnedANI}
                    LPAPR={aptZUSDCLPAPR}
                    stakeAPR={aptZUSDCPool.stakeAPR}
                    nativePrice={nativePrice}
                    hasRegisteredANI={hasRegisteredANI}
                    onRegisterANI={onRegisterANI}
                  ></FarmCard>
                )}
              </AutoRow>
            </AutoColumn>
          </AutoColumn>
        )}

        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <ThemedText.DeprecatedWhite fontWeight={600}>
                  <Trans>Liquidity provider rewards</Trans>
                </ThemedText.DeprecatedWhite>
              </RowBetween>
              <RowBetween>
                <ThemedText.DeprecatedWhite fontSize={14}>
                  <Trans>
                    Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are
                    added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
                  </Trans>
                </ThemedText.DeprecatedWhite>
              </RowBetween>
              <ExternalLink
                style={{ color: theme.deprecated_white, textDecoration: 'underline' }}
                target="_blank"
                href="https://docs.animeswap.org"
              >
                {/* <ThemedText.DeprecatedWhite fontSize={14}>
                  <Trans>Read more about providing liquidity</Trans>
                </ThemedText.DeprecatedWhite> */}
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>

        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="md" style={{ width: '100%', paddingBottom: '20px' }}>
            <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
              <HideSmall>
                <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                  <Trans>Your liquidity</Trans>
                </ThemedText.DeprecatedMediumHeader>
              </HideSmall>
              <ButtonRow>
                <ResponsiveButtonSecondary as={Link} padding="6px 8px" to="/add">
                  <Trans>Create a pair</Trans>
                </ResponsiveButtonSecondary>
                <ResponsiveButtonPrimary id="join-pool-button" as={Link} to="/add" padding="6px 8px">
                  <Text fontWeight={500} fontSize={16}>
                    <Trans>Add Liquidity</Trans>
                  </Text>
                </ResponsiveButtonPrimary>
              </ButtonRow>
            </TitleRow>

            {!account ? (
              <Card padding="40px">
                <ThemedText.DeprecatedBody color={theme.deprecated_text3} textAlign="center">
                  <Trans>Connect to a wallet to view your liquidity.</Trans>
                </ThemedText.DeprecatedBody>
              </Card>
            ) : pairTasksLoading ? (
              <EmptyProposals>
                <ThemedText.DeprecatedBody color={theme.deprecated_text3} textAlign="center">
                  <Dots>
                    <Trans>Loading</Trans>
                  </Dots>
                </ThemedText.DeprecatedBody>
              </EmptyProposals>
            ) : pairKeyNotZero.length > 0 ? (
              <>
                {/* <ButtonSecondary>
                  <RowBetween>
                    <Trans>
                      <ExternalLink href={'https://v2.info.uniswap.org/account/' + account}>
                        Account analytics and accrued fees
                      </ExternalLink>
                      <span> ↗ </span>
                    </Trans>
                  </RowBetween>
                </ButtonSecondary> */}
                {pairs.map(
                  (pair) =>
                    pair && (
                      <FullPositionCard key={pairKey(pair.coinX, pair.coinY)} pair={pair} nativePrice={nativePrice} />
                    )
                )}
              </>
            ) : (
              <EmptyProposals>
                <ThemedText.DeprecatedBody color={theme.deprecated_text3} textAlign="center">
                  <Trans>No liquidity found.</Trans>
                </ThemedText.DeprecatedBody>
              </EmptyProposals>
            )}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}
