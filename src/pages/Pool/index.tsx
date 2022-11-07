import { Trans } from '@lingui/macro'
import FarmCard, { FarmCardProps } from 'components/PositionCard/farmCard'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { useCoin } from 'hooks/common/Coin'
import { Pair, pairKey, useNativePrice } from 'hooks/common/Pair'
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import { useAccount, useAllLpBalance } from 'state/wallets/hooks'
import styled, { ThemeContext } from 'styled-components/macro'

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
  const nativePrice = useNativePrice()
  const allLpBalances = useAllLpBalance()

  const [pairTasksLoading, setPairTasksLoading] = useState<boolean>(true)
  const [pairs, setPairs] = useState<Pair[]>([])

  const pairKeyNotZero: string[] = []
  for (const pairKey in allLpBalances) {
    if (allLpBalances[pairKey] !== '0') {
      pairKeyNotZero.push(pairKey)
    }
  }
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

  const chainId = useChainId()
  const { aniCoin, nativeCoin } = getChainInfoOrDefault(chainId)
  const [aniPool, setAniPool] = useState<FarmCardProps>({})
  const [aptAniPool, setAptAniPool] = useState<FarmCardProps>({})

  useEffect(() => {
    const fetchStake = async () => {
      const res = await ConnectionInstance.getSDK().MasterChef.getUserInfoAll(account)
      console.log(res)
      const res2 = await ConnectionInstance.getSDK().MasterChef.getFirstTwoPairStakedLPInfo()
      console.log(res2)
      setAniPool({
        poolLP: res2[0]?.lpAmount,
        poolCoinXAmount: res2[0]?.lpAmount,
        stakeAPR: res2[0]?.apr,
      })
      setAptAniPool({
        poolLP: res2[1]?.lpAmount,
        poolCoinXAmount: res2[1]?.coinX,
        poolCoinYAmount: res2[1]?.coinY,
        stakeAPR: res2[1]?.apr,
      })
    }
    fetchStake()
  }, [chainId, account])

  return (
    <>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center" style={{ marginBottom: '2rem' }}>
          <AutoColumn gap="md" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '0.5rem' }} padding={'0'}>
              <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0rem', justifySelf: 'flex-start' }}>
                Stake and Farms
              </ThemedText.DeprecatedMediumHeader>
            </TitleRow>
            <AutoRow gap="5px" justify="space-around">
              <FarmCard
                coinX={aniCoin}
                poolLP={aniPool.poolLP}
                poolCoinXAmount={aniPool.poolCoinXAmount}
                stakeAPR={aniPool.stakeAPR}
                nativePrice={nativePrice}
              ></FarmCard>
              <FarmCard
                coinX={nativeCoin}
                coinY={aniCoin}
                poolLP={aptAniPool.poolLP}
                poolCoinXAmount={aniPool.poolCoinXAmount}
                poolCoinYAmount={aniPool.poolCoinYAmount}
                stakeAPR={aptAniPool.stakeAPR}
                nativePrice={nativePrice}
              ></FarmCard>
            </AutoRow>
          </AutoColumn>
        </AutoColumn>

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
