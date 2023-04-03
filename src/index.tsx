import '@reach/dialog/styles.css'
import 'inter-ui'
import 'components/analytics'

import { WalletKitProvider } from '@mysten/wallet-kit'
import { FeatureFlagsProvider } from 'featureFlags'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { LanguageProvider } from './i18n/LanguageProvider'
import App from './pages/App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import store from './state'
import UserUpdater from './state/user/updater'
import ThemeProvider, { ThemedGlobalStyle } from './theme'
import RadialGradientByChainUpdater from './theme/RadialGradientByChainUpdater'

function Updaters() {
  return (
    <>
      <RadialGradientByChainUpdater />
      <UserUpdater />
    </>
  )
}

const container = document.getElementById('root') as HTMLElement

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <WalletKitProvider>
        <FeatureFlagsProvider>
          <HashRouter>
            <LanguageProvider>
              <Updaters />
              <ThemeProvider>
                <ThemedGlobalStyle />
                <App />
              </ThemeProvider>
            </LanguageProvider>
          </HashRouter>
        </FeatureFlagsProvider>
      </WalletKitProvider>
    </Provider>
  </StrictMode>
)

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
