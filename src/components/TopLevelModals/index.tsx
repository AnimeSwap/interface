import AddressClaimModal from 'components/claim/AddressClaimModal'
import BindDiscordModal from 'components/claim/BindDiscordModal'
import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useAccount } from 'state/wallets/hooks'

export default function TopLevelModals() {
  const addressClaimOpen = useModalIsOpen(ApplicationModal.ADDRESS_CLAIM)
  const addressClaimToggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  const bindDiscordOpen = useModalIsOpen(ApplicationModal.BIND_DISCORD)
  const bindDiscordToggle = useToggleModal(ApplicationModal.BIND_DISCORD)

  // const account = useAccount()

  return (
    <>
      <AddressClaimModal isOpen={addressClaimOpen} onDismiss={addressClaimToggle} />
      <BindDiscordModal isOpen={bindDiscordOpen} onDismiss={bindDiscordToggle} />
    </>
  )
}
