import { Navigate, useParams } from 'react-router-dom'

import AddLiquidity from './index'

export function RedirectDuplicateTokenIds() {
  const { coinIdA, coinIdB } = useParams<{ coinIdA: string; coinIdB: string }>()

  if (coinIdA && coinIdB && coinIdA.toLowerCase() === coinIdB.toLowerCase()) {
    return <Navigate to={`/add/${coinIdA}`} replace />
  }

  return <AddLiquidity />
}
