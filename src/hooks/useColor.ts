import Vibrant from 'node-vibrant/lib/bundle.js'
import { shade } from 'polished'
import { useEffect, useState } from 'react'
import uriToHttp from 'utils/uriToHttp'
import { hex } from 'wcag-contrast'

import { Coin } from './common/Coin'

function URIForEthToken(address: string) {
  return `https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/${address}/logo.png`
}

async function getColorFromToken(coin: Coin): Promise<string | null> {
  const { address } = coin
  let logoURL = coin?.logoURL[0]
  if (!logoURL) {
    logoURL = URIForEthToken(address)
  }

  try {
    return await getColorFromUriPath(logoURL)
  } catch (e) {
    if (logoURL === URIForEthToken(address)) {
      return null
    }

    try {
      logoURL = URIForEthToken(address)
      return await getColorFromUriPath(logoURL)
    } catch (e) {}
  }

  return null
}

async function getColorFromUriPath(uri: string): Promise<string | null> {
  const formattedPath = uriToHttp(uri)[0]

  let palette

  try {
    palette = await Vibrant.from(formattedPath).getPalette()
  } catch (err) {
    return null
  }
  if (!palette?.Vibrant) {
    return null
  }

  let detectedHex = palette.Vibrant.hex
  let AAscore = hex(detectedHex, '#FFF')
  while (AAscore < 3) {
    detectedHex = shade(0.005, detectedHex)
    AAscore = hex(detectedHex, '#FFF')
  }

  return detectedHex
}

export function useColor(coin?: Coin) {
  const [color, setColor] = useState('#2172E5')

  useEffect(() => {
    let stale = false

    if (coin) {
      getColorFromToken(coin).then((coinColor) => {
        if (!stale && coinColor !== null) {
          setColor(coinColor)
        }
      })
    }

    return () => {
      stale = true
      setColor('#2172E5')
    }
  }, [coin])

  return color
}

export function useListColor(listImageUri?: string) {
  const [color, setColor] = useState('#2172E5')

  useEffect(() => {
    let stale = false

    if (listImageUri) {
      getColorFromUriPath(listImageUri).then((color) => {
        if (!stale && color !== null) {
          setColor(color)
        }
      })
    }

    return () => {
      stale = true
      setColor('#2172E5')
    }
  }, [listImageUri])

  return color
}
