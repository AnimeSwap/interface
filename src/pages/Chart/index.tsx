import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import PoolTable, { PoolData } from 'components/pools/PoolTable'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { isAptosChain, isSuiChain } from 'constants/chains'
import { BIG_INT_ZERO } from 'constants/misc'
import { Pair, pairKey } from 'hooks/common/Pair'
import { useEffect, useState } from 'react'
import { Text } from 'rebass'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { formatDollarAmount } from 'utils/formatDollarAmt'

import { AutoColumn } from '../../components/Column'
import { RowBetween, RowFixed } from '../../components/Row'
import { ThemedText } from '../../theme'

const ChartContainer = styled.div`
  width: 100%;
  min-width: 320px;
  max-width: 1200px;
  padding: 0px 12px;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  border-radius: 12px;
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  border-radius: 12px;
`

function queryPrice(pairs: { [pairKey: string]: Pair }, coinX: string, coinY: string): Decimal {
  if (coinX === coinY) return Utils.d(1)
  let y_per_x = BIG_INT_ZERO
  const pair_x_y = pairs[pairKey(coinX, coinY)]
  if (pair_x_y) {
    y_per_x = Utils.d(pair_x_y.coinYReserve).div(Utils.d(pair_x_y.coinXReserve))
  }
  const pair_y_x = pairs[pairKey(coinY, coinX)]
  if (pair_y_x) {
    y_per_x = Utils.d(pair_y_x.coinXReserve).div(Utils.d(pair_y_x.coinYReserve))
  }
  return y_per_x
}

function queryToUnitCoin(
  pairs: { [pairKey: string]: Pair },
  coinX: string,
  coinXReserve: string,
  coinY: string,
  coinYReserve: string,
  unitCoin: string
): Decimal {
  const unit_per_x = queryPrice(pairs, coinX, unitCoin)
  if (unit_per_x.gt(0)) {
    return unit_per_x.mul(Utils.d(coinXReserve)).mul(2)
  }
  const unit_per_y = queryPrice(pairs, coinY, unitCoin)
  if (unit_per_y.gt(0)) {
    return unit_per_y.mul(Utils.d(coinYReserve)).mul(2)
  }
  return BIG_INT_ZERO
}

export default function Explore() {
  const chainId = useChainId()
  const { nativeCoin, stableCoin } = getChainInfoOrDefault(chainId)
  const [poolDatas, setPoolDatas] = useState<PoolData[]>([])
  const [seeAll, setSeeAll] = useState<boolean>(false)
  const [tvlUSD, setTvlUSD] = useState<number>(0)

  useEffect(() => {
    const preparePoolData = async () => {
      const pairs = await ConnectionInstance.getAllPair()
      const USD_per_APT = queryPrice(pairs, nativeCoin.address, stableCoin.address)
      const tempPoolData: PoolData[] = []
      let totalTvlUSD = BIG_INT_ZERO
      for (const pair of Object.values(pairs)) {
        let tvlAPT = BIG_INT_ZERO
        let tvlUSD = BIG_INT_ZERO
        tvlAPT = queryToUnitCoin(
          pairs,
          pair.coinX,
          pair.coinXReserve,
          pair.coinY,
          pair.coinYReserve,
          nativeCoin.address
        )
        if (tvlAPT.gt(0)) {
          tvlUSD = tvlAPT.mul(USD_per_APT)
        } else {
          tvlUSD = queryToUnitCoin(
            pairs,
            pair.coinX,
            pair.coinXReserve,
            pair.coinY,
            pair.coinYReserve,
            stableCoin.address
          )
          tvlAPT = tvlUSD.div(USD_per_APT)
        }
        totalTvlUSD = totalTvlUSD.add(tvlUSD)
        tempPoolData.push({
          pair,
          APR: Number.isNaN(pair.APR) ? 0 : pair.APR,
          tvlAPT,
          tvlUSD: tvlUSD.div(Utils.pow10(stableCoin.decimals)).toNumber(),
          volumeUSD: 0,
          volumeUSDWeek: 0,
        })
      }
      setPoolDatas(tempPoolData)
      setTvlUSD(totalTvlUSD.div(Utils.pow10(stableCoin.decimals)).toNumber())
    }
    if (isAptosChain(chainId)) {
      preparePoolData()
    }

    const suiPreparePoolDate = async () => {
      const pairs = await ConnectionInstance.getSuiAllPair()
      const USD_per_SUI = queryPrice(pairs, nativeCoin.address, stableCoin.address)
      const tempPoolData: PoolData[] = []
      let totalTvlUSD = BIG_INT_ZERO
      for (const pair of Object.values(pairs)) {
        let tvlSUI = BIG_INT_ZERO
        let tvlUSD = BIG_INT_ZERO
        tvlSUI = queryToUnitCoin(
          pairs,
          pair.coinX,
          pair.coinXReserve,
          pair.coinY,
          pair.coinYReserve,
          nativeCoin.address
        )
        if (tvlSUI.gt(0)) {
          tvlUSD = tvlSUI.mul(USD_per_SUI)
        } else {
          tvlUSD = queryToUnitCoin(
            pairs,
            pair.coinX,
            pair.coinXReserve,
            pair.coinY,
            pair.coinYReserve,
            stableCoin.address
          )
          tvlSUI = tvlUSD.div(USD_per_SUI)
        }
        totalTvlUSD = totalTvlUSD.add(tvlUSD)
        tempPoolData.push({
          pair,
          APR: Number.isNaN(pair.APR) ? 0 : pair.APR,
          tvlSUI,
          tvlUSD: tvlUSD.div(Utils.pow10(stableCoin.decimals)).toNumber(),
          volumeUSD: 0,
          volumeUSDWeek: 0,
        })
      }
      setPoolDatas(tempPoolData)
      setTvlUSD(totalTvlUSD.div(Utils.pow10(stableCoin.decimals)).toNumber())
    }
    if (isSuiChain(chainId)) {
      suiPreparePoolDate()
    }
  }, [])

  // if (isSuiChain(chainId)) {
  //   return (
  //     <>
  //       <ChartContainer>
  //         <center>Sui Chart Coming Soon...</center>
  //       </ChartContainer>
  //     </>
  //   )
  // }

  if (isSuiChain(chainId)) {
    return (
      <ChartContainer>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="md" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
              <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                All Pools
              </ThemedText.DeprecatedMediumHeader>
              <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                TVL: {formatDollarAmount(tvlUSD)}
              </ThemedText.DeprecatedMediumHeader>
              <RowFixed>
                <ResponsiveButtonSecondary
                  padding="6px 8px"
                  style={{ marginTop: '0.5rem', justifySelf: 'flex-end' }}
                  onClick={() => {
                    window.open('https://www.coingecko.com/en/exchanges/animeswap', '_blank')
                  }}
                >
                  <Text fontWeight={500} fontSize={16}>
                    CoinGecko<sup>↗</sup>
                  </Text>
                </ResponsiveButtonSecondary>
                <ResponsiveButtonSecondary
                  padding="6px 8px"
                  style={{ marginTop: '0.5rem', justifySelf: 'flex-end' }}
                  onClick={() => {
                    window.open('https://coinmarketcap.com/exchanges/animeswap/', '_blank')
                  }}
                >
                  <Text fontWeight={500} fontSize={16}>
                    CoinMarketCap<sup>↗</sup>
                  </Text>
                </ResponsiveButtonSecondary>
                <ResponsiveButtonSecondary
                  padding="6px 8px"
                  marginLeft={'8px'}
                  style={{ marginTop: '0.5rem', justifySelf: 'flex-end' }}
                  onClick={() => {
                    window.open('https://dexscreener.com/aptos/animeswap', '_blank')
                  }}
                >
                  <Text fontWeight={500} fontSize={16}>
                    DEXScreener<sup>↗</sup>
                  </Text>
                </ResponsiveButtonSecondary>
              </RowFixed>
              {!seeAll && (
                <ResponsiveButtonPrimary
                  padding="6px 8px"
                  style={{ marginTop: '0.5rem', justifySelf: 'flex-end' }}
                  onClick={() => {
                    setSeeAll(true)
                  }}
                >
                  <Text fontWeight={500} fontSize={16}>
                    See All
                  </Text>
                </ResponsiveButtonPrimary>
              )}
            </TitleRow>
            <PoolTable poolDatas={poolDatas} maxItems={seeAll ? 200 : 10} showAPR={false} />
          </AutoColumn>
        </AutoColumn>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="md" style={{ width: '100%' }}>
          <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
            <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
              All Pools
            </ThemedText.DeprecatedMediumHeader>
            <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
              TVL: {formatDollarAmount(tvlUSD)}
            </ThemedText.DeprecatedMediumHeader>
            <RowFixed>
              <ResponsiveButtonSecondary
                padding="6px 8px"
                style={{ marginTop: '0.5rem', justifySelf: 'flex-end' }}
                onClick={() => {
                  window.open('https://www.coingecko.com/en/exchanges/animeswap', '_blank')
                }}
              >
                <Text fontWeight={500} fontSize={16}>
                  CoinGecko<sup>↗</sup>
                </Text>
              </ResponsiveButtonSecondary>
              <ResponsiveButtonSecondary
                padding="6px 8px"
                style={{ marginTop: '0.5rem', justifySelf: 'flex-end' }}
                onClick={() => {
                  if (isAptosChain(chainId)) {
                    window.open('https://coinmarketcap.com/exchanges/animeswap/', '_blank')
                  } else {
                    window.open('https://coinmarketcap.com/exchanges/animeswap-sui/', '_blank')
                  }
                }}
              >
                <Text fontWeight={500} fontSize={16}>
                  CoinMarketCap<sup>↗</sup>
                </Text>
              </ResponsiveButtonSecondary>
              <ResponsiveButtonSecondary
                padding="6px 8px"
                marginLeft={'8px'}
                style={{ marginTop: '0.5rem', justifySelf: 'flex-end' }}
                onClick={() => {
                  window.open('https://dexscreener.com/aptos/animeswap', '_blank')
                }}
              >
                <Text fontWeight={500} fontSize={16}>
                  DEXScreener<sup>↗</sup>
                </Text>
              </ResponsiveButtonSecondary>
            </RowFixed>
            {!seeAll && (
              <ResponsiveButtonPrimary
                padding="6px 8px"
                style={{ marginTop: '0.5rem', justifySelf: 'flex-end' }}
                onClick={() => {
                  setSeeAll(true)
                }}
              >
                <Text fontWeight={500} fontSize={16}>
                  See All
                </Text>
              </ResponsiveButtonPrimary>
            )}
          </TitleRow>
          <PoolTable poolDatas={poolDatas} maxItems={seeAll ? 200 : 10} />
        </AutoColumn>
      </AutoColumn>
    </ChartContainer>
  )
}
