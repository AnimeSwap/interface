import { Navigate, useParams } from 'react-router-dom'

import AddLiquidity from './index'

export function RedirectDuplicateTokenIds() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>()

  if (currencyIdA && currencyIdB && currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Navigate to={`/add/${currencyIdA}`} replace />
  }

  return <AddLiquidity />
}
