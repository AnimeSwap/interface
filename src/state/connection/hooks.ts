import { isAptosChain, isSuiChain, SupportedChainId } from 'constants/chains'
import { useMemo } from 'react'
import store from 'state'
import { useAppSelector } from 'state/hooks'
import { useChainId } from 'state/user/hooks'
import { updateChainId } from 'state/user/reducer'
import { setAccount } from 'state/wallets/reducer'

import ConnectionInstance from './instance'
import { ConnectionType, getRPCURL } from './reducer'

export function useConnection(): ConnectionType {
  return useAppSelector((state) => state.connection.currentConnection)
}

export function useConnectionURL(): string {
  const connection = useConnection()
  const chainId = useChainId()
  const connectionURL = getRPCURL(connection, chainId)
  return useMemo(() => {
    return connectionURL
  }, [connection, chainId, connectionURL])
}

export function switchChain(connection: ConnectionType, chainId: SupportedChainId) {
  const connectionURL = getRPCURL(connection, chainId)
  if (!connectionURL) {
    throw new Error(`Chain ${chainId} not supported for connection (${connection})`)
  }
  if (isAptosChain(chainId)) {
    ConnectionInstance.renewAptosClient(connection, chainId)
    ConnectionInstance.renewSDK(connection, chainId)
  }
  if (isSuiChain(chainId)) {
    ConnectionInstance.renewSuiClient(connection, chainId)
    ConnectionInstance.renewSuiSDK(connection, chainId)
  }
  store.dispatch(updateChainId({ chainId }))
}
