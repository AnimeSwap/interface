import TokenSafety from 'components/TokenSafety'
import { Coin, ImportCoinList } from 'hooks/common/Coin'
import usePrevious from 'hooks/usePrevious'
import { useWindowSize } from 'hooks/useWindowSize'
import { useCallback, useEffect, useState } from 'react'

import useLast from '../../hooks/useLast'
import Modal from '../Modal'
import { CoinSearch } from './CoinSearch'
import { ImportList } from './ImportList'
import Manage from './Manage'

interface CoinSearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Coin | null
  onCoinSelect: (currency: Coin) => void
  otherSelectedCurrency?: Coin | null
  showCommonBases?: boolean
  showCoinAmount?: boolean
  disableNonToken?: boolean
}

export enum CoinModalView {
  search,
  manage,
  importToken,
  importList,
}

export default function CoinSearchModal({
  isOpen,
  onDismiss,
  onCoinSelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = true,
  showCoinAmount = true,
  disableNonToken = false,
}: CoinSearchModalProps) {
  const [modalView, setModalView] = useState<CoinModalView>(CoinModalView.manage)
  const lastOpen = useLast(isOpen)

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setModalView(CoinModalView.search)
    }
  }, [isOpen, lastOpen])

  const handleCoinSelect = useCallback(
    (currency: Coin) => {
      onCoinSelect(currency)
      onDismiss()
    },
    [onDismiss, onCoinSelect]
  )

  // for token import view
  const prevView = usePrevious(modalView)

  // used for import token flow
  const [importToken, setImportToken] = useState<Coin | undefined>()

  // used for import list
  const [importList, setImportList] = useState<ImportCoinList | undefined>()
  const [listURL, setListUrl] = useState<string | undefined>()

  const showImportView = useCallback(() => setModalView(CoinModalView.importToken), [setModalView])
  const showManageView = useCallback(() => setModalView(CoinModalView.manage), [setModalView])
  const handleBackImport = useCallback(
    () => setModalView(prevView && prevView !== CoinModalView.importToken ? prevView : CoinModalView.search),
    [setModalView, prevView]
  )

  const { height: windowHeight } = useWindowSize()

  // change min height if not searching
  let modalHeight: number | undefined = 80
  let content
  switch (modalView) {
    case CoinModalView.search:
      if (windowHeight) {
        // Converts pixel units to vh for Modal component
        modalHeight = Math.min(Math.round((800 / windowHeight) * 100), 80)
      }
      content = (
        <CoinSearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCoinSelect={handleCoinSelect}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
          showCoinAmount={showCoinAmount}
          disableNonToken={disableNonToken}
          showImportView={showImportView}
          setImportToken={setImportToken}
          showManageView={showManageView}
        />
      )
      break
    case CoinModalView.importToken:
      if (importToken) {
        modalHeight = 50
        content = (
          <TokenSafety
            tokenAddress={importToken.address}
            onContinue={() => handleCoinSelect(importToken)}
            onCancel={handleBackImport}
          />
        )
      }
      break
    case CoinModalView.importList:
      modalHeight = 50
      if (importList && listURL) {
        content = <ImportList list={importList} listURL={listURL} onDismiss={onDismiss} setModalView={setModalView} />
      }
      break
    case CoinModalView.manage:
      modalHeight = 50
      content = (
        <Manage
          onDismiss={onDismiss}
          setModalView={setModalView}
          setImportToken={setImportToken}
          setImportList={setImportList}
          setListUrl={setListUrl}
        />
      )
      break
  }
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={modalHeight} minHeight={modalHeight}>
      {content}
    </Modal>
  )
}
