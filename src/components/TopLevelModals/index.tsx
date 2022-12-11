import AddressClaimModal from 'components/claim/AddressClaimModal'
// import ANIAirdropClaimModal from 'components/claim/ANIAirdropClaimModal'
// import BindDiscordModal from 'components/claim/BindDiscordModal'
import StakeModal from 'components/claim/StakeModal'
import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useAccount } from 'state/wallets/hooks'

export default function TopLevelModals() {
  const addressClaimOpen = useModalIsOpen(ApplicationModal.ADDRESS_CLAIM)
  const addressClaimToggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  // const bindDiscordOpen = useModalIsOpen(ApplicationModal.BIND_DISCORD)
  // const bindDiscordToggle = useToggleModal(ApplicationModal.BIND_DISCORD)
  const airdropClaimOpen = useModalIsOpen(ApplicationModal.ANI_AIRDROP_CLAIM)
  const airdropClaimToggle = useToggleModal(ApplicationModal.ANI_AIRDROP_CLAIM)
  const stakeOpen = useModalIsOpen(ApplicationModal.STAKE)
  const stakeToggle = useToggleModal(ApplicationModal.STAKE)

  return (
    <>
      <AddressClaimModal isOpen={addressClaimOpen} onDismiss={addressClaimToggle} />
      {/* <BindDiscordModal isOpen={bindDiscordOpen} onDismiss={bindDiscordToggle} /> */}
      {/* <ANIAirdropClaimModal isOpen={airdropClaimOpen} onDismiss={airdropClaimToggle} /> */}
      <StakeModal isOpen={stakeOpen} onDismiss={stakeToggle} />
    </>
  )
}
