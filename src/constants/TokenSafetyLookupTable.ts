export enum TOKEN_LIST_TYPES {
  UNI_DEFAULT = 1,
  UNI_EXTENDED,
  UNKNOWN,
  BLOCKED,
  BROKEN,
}

class TokenSafetyLookupTable {
  dict: { [key: string]: TOKEN_LIST_TYPES } | null = null

  createMap() {
    const dict: { [key: string]: TOKEN_LIST_TYPES } = {}
    let uniDefaultTokens = []
    let uniExtendedTokens = []
    const brokenTokens = []
    const unsupportTokens = []

    if (!uniDefaultTokens) {
      uniDefaultTokens = []
    }
    if (!uniExtendedTokens) {
      uniExtendedTokens = []
    }
    brokenTokens.forEach((token) => {
      dict[token.address.toLowerCase()] = TOKEN_LIST_TYPES.BROKEN
    })
    unsupportTokens.forEach((token) => {
      dict[token.address.toLowerCase()] = TOKEN_LIST_TYPES.BLOCKED
    })
    uniExtendedTokens.forEach((token) => {
      dict[token.address.toLowerCase()] = TOKEN_LIST_TYPES.UNI_EXTENDED
    })
    uniDefaultTokens.forEach((token) => {
      dict[token.address.toLowerCase()] = TOKEN_LIST_TYPES.UNI_DEFAULT
    })

    return dict
  }

  checkToken(address: string) {
    if (!this.dict) {
      this.dict = this.createMap()
    }
    return this.dict[address] ?? TOKEN_LIST_TYPES.UNKNOWN
  }
}

export default new TokenSafetyLookupTable()
