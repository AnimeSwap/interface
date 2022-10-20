import Vibrant from 'node-vibrant/lib/bundle.js'
import { shade } from 'polished'
import { useEffect, useState } from 'react'
import uriToHttp from 'utils/uriToHttp'
import { hex } from 'wcag-contrast'

import { Coin } from './common/Coin'

async function getColorFromToken(coin: Coin): Promise<string | null> {
  try {
    const logoURL = coin?.logoURL[0]
    return await getColorFromUriPath(logoURL)
  } catch (e) {
    return null
  }
}

async function getColorFromUriPath(uri: string): Promise<string | null> {
  let palette
  try {
    const formattedPath = uriToHttp(uri)[0]
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
  const [color, setColor] = useState('#8A2BE2')

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
      setColor('#8A2BE2')
    }
  }, [coin])

  return color
}

export function useListColor(listImageUri?: string) {
  const [color, setColor] = useState('#8A2BE2')

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
      setColor('#8A2BE2')
    }
  }, [listImageUri])

  return color
}
