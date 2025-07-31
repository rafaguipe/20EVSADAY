import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const Container = styled.div`
  padding: 32px 16px;
  max-width: 900px;
  margin: 0 auto;
  background: ${({ theme }) => theme.background};
  
  @media (max-width: 768px) {
    padding: 24px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 8px;
  }
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 32px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }
`;

const Description = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 8px;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #4a6a8a;
  }
`;

const CardLayout = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
`;

const Thumbnail = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
  }
`;

const CardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
  line-height: 1.4;
`;

const CardDescription = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #6a6a6a;
  line-height: 1.5;
  margin-bottom: 8px;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #4a6a8a;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }
`;

const Price = styled.span`
  color: #4CAF50;
  font-weight: bold;
`;

const Date = styled.span`
  color: #FF9800;
`;

const ExternalLink = styled.a`
  color: #4a6a8a;
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  display: inline-block;
  margin-top: 8px;
  
  &:hover {
    color: #357a6a;
    text-decoration: underline;
  }
`;

const CardLink = styled.div`
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
`;

const Loja = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_system_setting', {
          p_key: 'loja_products'
        });

      if (error) {
        console.error('Erro ao carregar produtos:', error);
        setProdutos([]);
        return;
      }

      const productsList = data ? JSON.parse(data) : [];
      // Filtrar apenas produtos ativos
      const activeProducts = productsList.filter(product => product.active);
      setProdutos(activeProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>🛒 Loja</Title>
        <Description>
          Produtos e eventos relacionados ao Estado Vibracional
        </Description>
        <EmptyState>
          <div>Carregando produtos...</div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🛒 Loja</Title>
              <Description>
          Produtos e eventos relacionados ao Estado Vibracional
        </Description>

      {produtos.length === 0 ? (
        <EmptyState>
          <div>🛍️ Nenhum produto disponível no momento</div>
          <div>Volte em breve para novidades!</div>
        </EmptyState>
      ) : (
        <Grid>
          {produtos.map((produto) => (
            <Card key={produto.id}>
              <CardLink onClick={() => window.open(produto.link, '_blank', 'noopener,noreferrer')}>
                <CardLayout>
                  <Thumbnail 
                    src={produto.thumbnail || '/assets/placeholder-workshop.png'} 
                    alt={produto.title}
                    onError={(e) => {
                      e.target.src = '/assets/placeholder-workshop.png';
                    }}
                  />
                  <CardContent>
                    <CardTitle>{produto.title}</CardTitle>
                    <CardDescription>{produto.description}</CardDescription>
                    <CardMeta>
                      <Price>{produto.price}</Price>
                      <Date>{produto.date} • {produto.time}</Date>
                    </CardMeta>
                    <ExternalLink href={produto.link} target="_blank" rel="noopener noreferrer">
                      Ver Evento →
                    </ExternalLink>
                  </CardContent>
                </CardLayout>
              </CardLink>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Loja; 