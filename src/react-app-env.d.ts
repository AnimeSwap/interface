/// <reference types="react-scripts" />

declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement
}

interface Window {
  aptos?: any
  martian?: any
  fewcha?: any
  pontem?: any
  rise?: any
  bitkeep?: any
  trustwallet?: any
  farmCardProps?: any
  farmCardBalance?: any
  farmCardAction?: any
  shares?: number
}
