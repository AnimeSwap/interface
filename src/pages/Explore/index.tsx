import styled from 'styled-components/macro'

const ExploreContainer = styled.div`
  width: 100%;
  min-width: 320px;
  padding: 0px 12px;
`

const TitleContainer = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 4rem;
  display: flex;
  align-items: center;
  jusitfy-content: center;
  flex-direction: column;
`

const Explore = () => {
  return (
    <ExploreContainer>
      <TitleContainer>Coming Soon...</TitleContainer>
    </ExploreContainer>
  )
}

export default Explore
