import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ theme }) => theme.background};
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const CardDescription = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #cccccc;
  line-height: 1.5;
  margin-bottom: 15px;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #4a6a8a;
`;

const Price = styled.span`
  color: #4CAF50;
  font-weight: bold;
`;

const Date = styled.span`
  color: #FF9800;
`;

const ExternalLink = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
  
  &:hover {
    text-decoration: none;
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
  const produtos = [
    {
      id: 1,
      title: 'Workshop Jogos Evolutivos',
      description: 'Aprenda a fazer jogos evolutivos usando jogos eletrônicos. Workshop online sobre ludologia interassistencial.',
      thumbnail: '/assets/workshop-jogos-evolutivos.svg',
      price: 'Online',
      date: '26.07.2025',
      time: '9h00 às 12h00',
      link: 'https://www.sympla.com.br/evento-online/workshop-jogos-evolutivos-jogos-eletronicos-online/2991500?_gl=1*1xmmzhj*_gcl_au*MjEzMzExMTg0OS4xNzQ5NDYyOTk2*_ga*OTI4NjI2MzcuMTcyMTQ0MjExMA..*_ga_KXH10SQTZF*czE3NTMyOTY4OTckbzkkZzEkdDE3NTMyOTc1NTQkajUzJGwwJGgxNTc2NzU3MzI2',
      external: true
    }
  ];

  return (
    <Container>
      <Title>🛒 Loja</Title>
      <Description>
        Produtos e eventos relacionados a Jogos Evolutivos e Conscienciologia
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
              <ExternalLink href={produto.link} target="_blank" rel="noopener noreferrer">
                <Thumbnail 
                  src={produto.thumbnail} 
                  alt={produto.title}
                  onError={(e) => {
                    e.target.src = '/assets/placeholder-workshop.svg';
                  }}
                />
                <CardContent>
                  <CardTitle>{produto.title}</CardTitle>
                  <CardDescription>{produto.description}</CardDescription>
                  <CardMeta>
                    <Price>{produto.price}</Price>
                    <Date>{produto.date} • {produto.time}</Date>
                  </CardMeta>
                </CardContent>
              </ExternalLink>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Loja; 