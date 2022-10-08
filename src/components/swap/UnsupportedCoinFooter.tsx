import { Trans } from '@lingui/macro'
import { ButtonEmpty } from 'components/Button'
import Card, { OutlineCard } from 'components/Card'
import CoinLogo from 'components/CoinLogo'
import { AutoColumn } from 'components/Column'
import Modal from 'components/Modal'
import { AutoRow, RowBetween } from 'components/Row'
import { Coin } from 'hooks/common/Coin'
import { useState } from 'react'
import { useChainId } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { CloseIcon, ExternalLink, ThemedText, Z_INDEX } from 'theme'

import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'

const DetailsFooter = styled.div<{ show: boolean }>`
  padding-top: calc(16px + 2rem);
  padding-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
  margin-top: -2rem;
  width: 100%;
  max-width: 400px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  color: ${({ theme }) => theme.deprecated_text2};
  background-color: ${({ theme }) => theme.deprecated_advancedBG};
  z-index: ${Z_INDEX.deprecated_zero};

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
  text-align: center;
`

const StyledButtonEmpty = styled(ButtonEmpty)`
  text-decoration: none;
`

const AddressText = styled(ThemedText.DeprecatedBlue)`
  font-size: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
`}
`

export default function UnsupportedCoinFooter({
  show,
  currencies,
}: {
  show: boolean
  currencies: (Coin | undefined | null)[]
}) {
  const chainId = useChainId()
  const [showDetails, setShowDetails] = useState(false)

  const tokens = currencies

  return (
    <DetailsFooter show={show}>
      <Modal isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
        <Card padding="2rem">
          <AutoColumn gap="lg">
            <RowBetween>
              <ThemedText.DeprecatedMediumHeader>
                <Trans>Unsupported Assets</Trans>
              </ThemedText.DeprecatedMediumHeader>
              <CloseIcon onClick={() => setShowDetails(false)} />
            </RowBetween>
            {tokens.map((token) => {
              return (
                token && (
                  <OutlineCard key={token.address?.concat('not-supported')}>
                    <AutoColumn gap="10px">
                      <AutoRow gap="5px" align="center">
                        <CoinLogo coin={token} size={'24px'} />
                        <ThemedText.DeprecatedBody fontWeight={500}>{token.symbol}</ThemedText.DeprecatedBody>
                      </AutoRow>
                      {chainId && (
                        <ExternalLink href={getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS)}>
                          <AddressText>{token.address}</AddressText>
                        </ExternalLink>
                      )}
                    </AutoColumn>
                  </OutlineCard>
                )
              )
            })}
            <AutoColumn gap="lg">
              <ThemedText.DeprecatedBody fontWeight={500}>
                <Trans>
                  Some assets are not available through this interface because they may not work well with the smart
                  contracts or we are unable to allow trading for legal reasons.
                </Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          </AutoColumn>
        </Card>
      </Modal>
      <StyledButtonEmpty padding={'0'} onClick={() => setShowDetails(true)}>
        <ThemedText.DeprecatedBlue>
          <Trans>Read more about unsupported assets</Trans>
        </ThemedText.DeprecatedBlue>
      </StyledButtonEmpty>
    </DetailsFooter>
  )
}
