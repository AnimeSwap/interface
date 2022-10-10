import { SupportedChainId } from '../constants/chains'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return value.match(/^(0x)?[0-9a-fA-F]{60,}$/) ? value : false
  } catch {
    return false
  }
}

// Azard: not very strict check
export function isCoinAddress(value: any): string | false {
  try {
    return value.match(/0x[0-9a-zA-Z:]{10,}$/) ? value : false
  } catch {
    return false
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(parsed.length - chars)}`
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const replaceURLParam = (search: string, param: string, newValue: string) => {
  const searchParams = new URLSearchParams(search)
  searchParams.set(param, newValue)
  return searchParams.toString()
}

/**
 * Returns the input chain ID if chain is supported. If not, return undefined
 * @param chainId a chain ID, which will be returned if it is a supported chain ID
 */
export function supportedChainId(chainId: number | undefined): SupportedChainId | undefined {
  if (typeof chainId === 'number' && chainId in SupportedChainId) {
    return chainId
  }
  return undefined
}
