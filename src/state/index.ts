import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import { load, save } from 'redux-localstorage-simple'
import { isTestEnv } from 'utils/env'

import application from './application/reducer'
import burn from './burn/reducer'
import connection from './connection/reducer'
import { updateVersion } from './global/actions'
import lists from './lists/reducer'
import mint from './mint/reducer'
import swap from './swap/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
import wallets from './wallets/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists', 'wallets']
const NAMESPACE = 'AnimeSwap20221009'

const store = configureStore({
  reducer: {
    application,
    user,
    connection,
    transactions,
    wallets,
    swap,
    mint,
    burn,
    lists,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true }).concat(
      save({
        states: PERSISTED_KEYS,
        debounce: 1000,
        namespace: NAMESPACE,
        namespaceSeparator: '::',
      })
    ),
  preloadedState: load({
    states: PERSISTED_KEYS,
    namespace: NAMESPACE,
    namespaceSeparator: '::',
    disableWarnings: isTestEnv(),
  }),
})

store.dispatch(updateVersion())

setupListeners(store.dispatch)

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
