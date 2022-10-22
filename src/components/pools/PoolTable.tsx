import { Decimal, Utils } from '@animeswap.org/v1-sdk'
import { DarkCard, GreyBadge } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DoubleCoinLogo from 'components/DoubleLogo'
import Loader, { LoadingRows } from 'components/Loader'
import { RowFixed } from 'components/Row'
import { Arrow, Break, PageButtons } from 'components/shared'
import { ClickableText, Label } from 'components/Text'
import { Coin, CoinAmount, useCoin } from 'hooks/common/Coin'
import { Pair } from 'hooks/common/Pair'
import useTheme from 'hooks/useTheme'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ThemedText } from 'theme'
import { formatDollarAmount } from 'utils/formatDollarAmt'

const Wrapper = styled(DarkCard)`
  width: 100%;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 20px 3.5fr repeat(3, 1fr);

  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1.5fr repeat(2, 1fr);
    & :nth-child(3) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 20px 1.5fr repeat(1, 1fr);
    & :nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 2.5fr repeat(1, 1fr);
    > *:nth-child(1) {
      display: none;
    }
  }
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const SORT_FIELD = {
  feeTier: 'feeTier',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  volumeUSDWeek: 'volumeUSDWeek',
}

const DataRow = ({ poolData, index }: { poolData: PoolData; index: number }) => {
  const coinX = useCoin(poolData.pair.coinX)
  const coinY = useCoin(poolData.pair.coinY)
  const coinXAmount = new CoinAmount(coinX, Utils.d(poolData.pair.coinXReserve))
  const coinYAmount = new CoinAmount(coinY, Utils.d(poolData.pair.coinYReserve))
  return (
    <LinkWrapper to={'swap/?inputCoin=' + poolData.pair.coinX + '&outputCoin=' + poolData.pair.coinY}>
      <ResponsiveGrid>
        <Label fontWeight={400}>{index + 1}</Label>
        <Label fontWeight={400}>
          <RowFixed>
            <DoubleCoinLogo coinX={coinX} coinY={coinY} size={24} sizeraw={44} margin={true} />
            <ThemedText.DeprecatedLabel ml="8px">
              {coinX?.symbol}/{coinY?.symbol}
            </ThemedText.DeprecatedLabel>
            <GreyBadge ml="10px" fontSize="14px">
              0.3%
            </GreyBadge>
          </RowFixed>
        </Label>
        <Label end={1} fontWeight={400}>
          <RowFixed>
            <ThemedText.DeprecatedSubHeader>
              {coinXAmount.prettyWithSymbol()} {'\n'} {coinYAmount.prettyWithSymbol()}
            </ThemedText.DeprecatedSubHeader>
          </RowFixed>
        </Label>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(poolData.tvlUSD)}
        </Label>
        {/* <Label end={1} fontWeight={400}>
          {formatDollarAmount(poolData.volumeUSD)}
        </Label>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(poolData.volumeUSDWeek)}
        </Label> */}
      </ResponsiveGrid>
    </LinkWrapper>
  )
}

const MAX_ITEMS = 10

export interface PoolData {
  pair: Pair
  tvlAPT: Decimal
  tvlUSD: number
  volumeUSD: number
  volumeUSDWeek: number
}

export default function PoolTable({ poolDatas, maxItems = MAX_ITEMS }: { poolDatas: PoolData[]; maxItems?: number }) {
  // theming
  const theme = useTheme()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  useEffect(() => {
    let extraPages = 1
    if (poolDatas.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(poolDatas.length / maxItems) + extraPages)
  }, [maxItems, poolDatas])

  const sortedPools = useMemo(() => {
    return poolDatas
      ? poolDatas
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof PoolData] > b[sortField as keyof PoolData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [maxItems, page, poolDatas, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField]
  )

  if (!poolDatas) {
    return <Loader />
  }

  return (
    <Wrapper>
      {sortedPools.length > 0 ? (
        <AutoColumn gap="16px">
          <ResponsiveGrid>
            <Label color={theme.deprecated_text2}>#</Label>
            <ClickableText color={theme.deprecated_text2}>Pool</ClickableText>
            <ClickableText color={theme.deprecated_text2} end={1}>
              Reserve
            </ClickableText>
            <ClickableText color={theme.deprecated_text2} end={1} onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
              TVL {arrow(SORT_FIELD.tvlUSD)}
            </ClickableText>
            {/* <ClickableText color={theme.deprecated_text2} end={1} onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
              Volume 24H {arrow(SORT_FIELD.volumeUSD)}
            </ClickableText>
            <ClickableText color={theme.deprecated_text2} end={1} onClick={() => handleSort(SORT_FIELD.volumeUSDWeek)}>
              Volume 7D {arrow(SORT_FIELD.volumeUSDWeek)}
            </ClickableText> */}
          </ResponsiveGrid>
          <Break />
          {sortedPools.map((poolData, i) => {
            if (poolData) {
              return (
                <React.Fragment key={i}>
                  <DataRow index={(page - 1) * MAX_ITEMS + i} poolData={poolData} />
                  <Break />
                </React.Fragment>
              )
            }
            return null
          })}
          <PageButtons>
            <div
              onClick={() => {
                setPage(page === 1 ? page : page - 1)
              }}
            >
              <Arrow faded={page === 1 ? true : false}>←</Arrow>
            </div>
            <ThemedText.DeprecatedBody>{'Page ' + page + ' of ' + maxPage}</ThemedText.DeprecatedBody>
            <div
              onClick={() => {
                setPage(page === maxPage ? page : page + 1)
              }}
            >
              <Arrow faded={page === maxPage ? true : false}>→</Arrow>
            </div>
          </PageButtons>
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
          <div />
          <div />
          <div />
          <div />
        </LoadingRows>
      )}
    </Wrapper>
  )
}
