import Footer from 'components/Footer'
import Loader from 'components/Loader'
import TopLevelModals from 'components/TopLevelModals'
import { useFeatureFlagsIsLoaded } from 'featureFlags'
import { Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'

import { useAnalyticsReporter } from '../components/analytics'
import ErrorBoundary from '../components/ErrorBoundary'
import Header from '../components/Header'
import Popups from '../components/Popups'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import { RedirectDuplicateTokenIds } from './AddLiquidity/redirects'
import Explore from './Explore'
import PoolV2 from './Pool/v2'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 120px 16px 0px 16px;
  align-items: center;
  flex: 1;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 4rem 8px 16px 8px;
  `};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: 2;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const FooterWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: center;
  position: fixed;
  bottom: 80px;
`

const BottomRightLogo = styled.div`
  background: url('images/33_open.43a09438.png');
  width: 216px;
  height: 212px;
  position: fixed;
  right: 0px;
  bottom: 0px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    scale: 0.8;
    right: -22px;
    bottom: -22px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    scale: 0.5;
    right: -56px;
    bottom: -54px;
  `};
`

const BottomLeftLogo = styled.div`
  background: url('images/22_open.72c00877.png');
  width: 232px;
  height: 210px;
  position: fixed;
  left: 0px;
  bottom: 0px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    scale: 0.8;
    left: -22px;
    bottom: -22px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    scale: 0.5;
    left: -56px;
    bottom: -54px;
  `};
`

export default function App() {
  const isLoaded = useFeatureFlagsIsLoaded()
  const { pathname } = useLocation()

  useAnalyticsReporter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <ErrorBoundary>
      <DarkModeQueryParamReader />
      <AppWrapper>
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper>
          <Popups />
          <TopLevelModals />
          <Suspense fallback={<Loader />}>
            {isLoaded ? (
              <Routes>
                <Route path="swap/:toCoin" element={<RedirectToSwap />} />
                <Route path="swap" element={<Swap />} />

                <Route path="pool/find" element={<PoolFinder />} />
                <Route path="pool" element={<PoolV2 />} />
                <Route path="add" element={<RedirectDuplicateTokenIds />}>
                  <Route path=":coinIdA" />
                  <Route path=":coinIdA/:coinIdB" />
                </Route>
                <Route path="remove/:coinIdA/:coinIdB" element={<RemoveLiquidity />} />

                <Route path="explore" element={<Explore />} />

                <Route path="*" element={<RedirectPathToSwapOnly />} />
              </Routes>
            ) : (
              <Loader />
            )}
          </Suspense>
          <Marginer />
        </BodyWrapper>
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
        <BottomRightLogo />
        <BottomLeftLogo />
      </AppWrapper>
    </ErrorBoundary>
  )
}
