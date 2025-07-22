import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 32px 16px;
  max-width: 900px;
  margin: 0 auto;
  background: ${({ theme }) => theme.background};
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 32px;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
`;

const List = styled.ul`
  list-style: disc inside;
  color: ${({ theme }) => theme.text};
`;

const Link = styled.a`
  color: #4a6a8a;
  text-decoration: underline;
  font-family: 'Press Start 2P', monospace;
  font-size: 1rem;
  &:hover {
    color: #357a6a;
  }
`;

const Multimidia = () => (
  <Container>
    <Title>Referências Multimídia sobre EV</Title>
    <Section>
      <SectionTitle>Vídeos</SectionTitle>
      <List>
        <li>
          <Link href="https://www.youtube.com/watch?v=bqvBu3DIMQ4" target="_blank" rel="noopener noreferrer">
            O que é Estado Vibracional? (YouTube)
          </Link>
        </li>
      </List>
    </Section>
  </Container>
);

export default Multimidia; 