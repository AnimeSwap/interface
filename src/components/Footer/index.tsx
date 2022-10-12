import { ReactComponent as Blog } from 'assets/blog.svg'
import { ReactComponent as Discord } from 'assets/discord.svg'
import { ReactComponent as GitHub } from 'assets/github.svg'
import { ReactComponent as Help } from 'assets/help.svg'
import { ReactComponent as Twitter } from 'assets/twitter.svg'
import styled from 'styled-components/macro'

const FooterItem = styled.a`
  margin-left: 1rem;
  margin-right: 1rem;
  fill: ${({ theme }) => theme.deprecated_text3};
  :hover {
    fill: ${({ theme }) => theme.deprecated_text2};
  }
`

export default function Footer() {
  return (
    <>
      <FooterItem target="_blank" href="https://docs.animeswap.org" rel="noreferrer">
        <Blog width="36px" height="36px"></Blog>
      </FooterItem>
      <FooterItem target="_blank" href="https://discord.gg/rbUG6SpRAM" rel="noreferrer">
        <Discord width="36px" height="36px"></Discord>
      </FooterItem>
      <FooterItem target="_blank" href="https://twitter.com/animeswap_org" rel="noreferrer">
        <Twitter width="36px" height="36px"></Twitter>
      </FooterItem>
      <FooterItem target="_blank" href="https://github.com/AnimeSwap" rel="noreferrer">
        <GitHub width="36px" height="36px"></GitHub>
      </FooterItem>
      <FooterItem target="_blank" href="https://animeswap.org" rel="noreferrer">
        <Help width="36px" height="36px"></Help>
      </FooterItem>
    </>
  )
}
