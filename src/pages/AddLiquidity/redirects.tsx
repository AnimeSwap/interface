import { Navigate, useParams } from 'react-router-dom'

import AddLiquidity from './index'

export function RedirectDuplicateTokenIds() {
  const { CoinIdA, coinIdB } = useParams<{ CoinIdA: string; coinIdB: string }>()
  if (CoinIdA && coinIdB && CoinIdA.toLowerCase() === coinIdB.toLowerCase()) {
    return <Navigate to={`/add/${CoinIdA}`} replace />
  }

  return <AddLiquidity />
}
