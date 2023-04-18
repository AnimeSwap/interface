import { isSuiChain, SupportedChainId } from 'constants/chains'
import { useEffect } from 'react'
import { useChainId, useDarkModeManager } from 'state/user/hooks'
const initialStyles = {
  width: '200vw',
  height: '200vh',
  transform: 'translate(-50vw, -100vh)',
  backgroundBlendMode: '',
}
const backgroundResetStyles = {
  width: '100vw',
  height: '100vh',
  transform: 'unset',
  backgroundBlendMode: '',
}

type TargetBackgroundStyles = typeof initialStyles | typeof backgroundResetStyles

const backgroundRadialGradientElement = document.getElementById('background-radial-gradient')
const setBackground = (newValues: TargetBackgroundStyles) =>
  Object.entries(newValues).forEach(([key, value]) => {
    if (backgroundRadialGradientElement) {
      backgroundRadialGradientElement.style[key as keyof typeof backgroundResetStyles] = value
    }
  })
export default function RadialGradientByChainUpdater(): null {
  const chainId = useChainId()
  const [darkMode] = useDarkModeManager()
  // manage background color
  useEffect(() => {
    if (!backgroundRadialGradientElement) {
      return
    }
    if (isSuiChain(chainId)) {
      setBackground(backgroundResetStyles)
      const suiLightGradient =
        'radial-gradient(100% 100% at 50% 0%, rgba(205, 232, 251, 0.7) 0%, rgba(252, 243, 249, 0.6536) 49.48%, rgba(255, 255, 255, 0) 100%), #FFFFFF'
      const suiDarkGradient =
        'radial-gradient(100% 100% at 50% 0%, rgba(10, 41, 75, 0.7) 0%, rgba(34, 30, 48, 0.6536) 49.48%, rgba(31, 33, 40, 0) 100%), #0D0E0E'
      backgroundRadialGradientElement.style.background = darkMode ? suiDarkGradient : suiLightGradient
    } else {
      setBackground(initialStyles)
      backgroundRadialGradientElement.style.background = ''
    }
  }, [darkMode, chainId])
  return null
}
