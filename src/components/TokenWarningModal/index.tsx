import { ImportToken } from 'components/SearchModal/ImportToken'
import { Coin } from 'hooks/common/Coin'

import Modal from '../Modal'

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
  onDismiss,
}: {
  isOpen: boolean
  tokens: Coin[]
  onConfirm: () => void
  onDismiss: () => void
}) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      <ImportToken tokens={tokens} handleCoinSelect={onConfirm} />
    </Modal>
  )
}
