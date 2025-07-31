import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

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
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Content = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 8px;
  padding: 24px;
  line-height: 1.6;
`;

const Text = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text};
  white-space: pre-wrap;
  line-height: 1.6;
`;

const LoadingText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: #6a6a6a;
  text-align: center;
  padding: 20px;
`;

const Sobre = () => {
  const [gpcText, setGpcText] = useState('');
  const [liderareText, setLiderareText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Carregar texto sobre GPC
      const { data: gpcData, error: gpcError } = await supabase
        .rpc('get_system_setting', {
          p_key: 'sobre_gpc_text'
        });

      if (gpcError) {
        console.error('Erro ao carregar texto GPC:', gpcError);
      } else {
        setGpcText(gpcData || 'Texto sobre GPC Jogos Evolutivos não configurado.');
      }

      // Carregar texto sobre Liderare
      const { data: liderareData, error: liderareError } = await supabase
        .rpc('get_system_setting', {
          p_key: 'sobre_liderare_text'
        });

      if (liderareError) {
        console.error('Erro ao carregar texto Liderare:', liderareError);
      } else {
        setLiderareText(liderareData || 'Texto sobre IC Liderare não configurado.');
      }

    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>Sobre</Title>
        <LoadingText>Carregando informações...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Sobre</Title>
      
      <Section>
        <SectionTitle>🎮 GPC Jogos Evolutivos</SectionTitle>
        <Content>
          <Text>{gpcText}</Text>
        </Content>
      </Section>

      <Section>
        <SectionTitle>🏛️ IC Liderare</SectionTitle>
        <Content>
          <Text>{liderareText}</Text>
        </Content>
      </Section>
    </Container>
  );
};

export default Sobre; 