import { Navigate, useLocation, useParams } from 'react-router-dom'

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly() {
  const location = useLocation()
  return <Navigate to={{ ...location, pathname: '/swap' }} replace />
}

// Redirects from the /swap/:toCoin path to the /swap?toCoin=:toCoin format
export function RedirectToSwap() {
  const location = useLocation()
  const { search } = location
  const { toCoin } = useParams<{ toCoin: string }>()

  return (
    <Navigate
      to={{
        ...location,
        pathname: '/swap',
        search: search && search.length > 1 ? `${search}&outputCoin=${toCoin}` : `?outputCoin=${toCoin}`,
      }}
      replace
    />
  )
}
