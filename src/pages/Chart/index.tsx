import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { Trans } from '@lingui/macro'
import PoolTable, { PoolData } from 'components/pools/PoolTable'
import { Dots } from 'components/swap/styleds'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { BIG_INT_ZERO } from 'constants/misc'
import { Coin, useCoin } from 'hooks/common/Coin'
import { Pair, pairKey } from 'hooks/common/Pair'
import { useContext, useEffect, useState } from 'react'
import ConnectionInstance from 'state/connection/instance'
import { useChainId } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from '../../components/Column'
import { RowBetween, RowFixed } from '../../components/Row'
import { ExternalLink, HideSmall, ThemedText } from '../../theme'

const ChartContainer = styled.div`
  width: 100%;
  min-width: 320px;
  max-width: 800px;
  padding: 0px 12px;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
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

function queryPrice(pairs: { [pairKey: string]: Pair }, coinX: string, coinY: string): Decimal {
  if (coinX === coinY) return Utils.d(1)
  let y_per_x = BIG_INT_ZERO
  const pair_x_y = pairs[pairKey(coinX, coinY)]
  if (pair_x_y) {
    y_per_x = Utils.d(pair_x_y.coinYReserve).div(Utils.d(pair_x_y.coinXReserve))
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
  const native_per_x = queryPrice(pairs, coinX, unitCoin)
  if (native_per_x.gt(0)) {
    return native_per_x.mul(Utils.d(coinXReserve)).mul(2)
  }
  const native_per_y = queryPrice(pairs, coinY, unitCoin)
  if (native_per_y.gt(0)) {
    return native_per_y.mul(Utils.d(coinYReserve)).mul(2)
  }
  return BIG_INT_ZERO
}

export default function Explore() {
  const chainId = useChainId()
  const { nativeCoin, stableCoin } = getChainInfoOrDefault(chainId)
  const [poolDatas, setPoolDatas] = useState<PoolData[]>([])

  useEffect(() => {
    const preparePoolData = async () => {
      const pairs = await ConnectionInstance.getAllPair()
      const USD_per_APT = queryPrice(pairs, nativeCoin.address, stableCoin.address)
      // .div(
      //   Utils.pow10(stableCoin.decimals - nativeCoin.decimals)
      // )
      const tempPoolData: PoolData[] = []
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
        tempPoolData.push({
          pair,
          tvlAPT,
          tvlUSD,
          volumeUSD: 0,
          volumeUSDWeek: 0,
        })
      }
      setPoolDatas(tempPoolData)
    }
    preparePoolData()
  }, [])

  return (
    <ChartContainer>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="md" style={{ width: '100%' }}>
          <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
            <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
              All Pools
            </ThemedText.DeprecatedMediumHeader>
          </TitleRow>
          <PoolTable poolDatas={poolDatas} />
        </AutoColumn>
      </AutoColumn>
    </ChartContainer>
  )
}
