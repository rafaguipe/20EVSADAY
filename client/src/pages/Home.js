import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const Hero = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
`;

const Logo = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const LogoMain = styled.div`
  font-family: 'Georgia', serif;
  font-size: 64px;
  font-weight: bold;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const LogoSub = styled.div`
  font-family: 'Arial', sans-serif;
  font-size: 24px;
  color: #ffd700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const LogoLine = styled.div`
  width: 100%;
  height: 3px;
  background: #ffd700;
  margin: 0 auto 8px auto;
  max-width: 200px;
`;

const LogoGPC = styled.div`
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  color: #ffffff;
  text-align: right;
  margin-top: -12px;
  margin-right: 20px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-right: 15px;
  }
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 48px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 4px;
  animation: glow 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #6a6a6a;
  margin-bottom: 40px;
  max-width: 600px;
  line-height: 1.8;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
`;

const FeatureCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6a6a6a;
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const FeatureText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;
  line-height: 1.6;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled(Link)`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 15px 30px;
  border: 2px solid #4a4a4a;
  background: #1a1a1a;
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:hover {
    background: #4a4a4a;
    border-color: #6a6a6a;
    transform: translateY(-2px);
  }
  
  &.primary {
    background: #2a4a6a;
    border-color: #4a6a8a;
    
    &:hover {
      background: #4a6a8a;
      border-color: #6a8aaa;
    }
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
`;

const StatCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const StatNumber = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-transform: uppercase;
`;

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Hero>
        <Logo>
          <LogoMain>JOGOS</LogoMain>
          <LogoSub>EVOLUTIVOS</LogoSub>
          <LogoLine />
          <LogoGPC>GPC</LogoGPC>
        </Logo>
        
        <Title>#20EVSADAY</Title>
        <Subtitle>
          Registre seus Estados Vibracionais de forma gamificada. 
          Acompanhe seu progresso, conquiste badges e participe do ranking 
          da comunidade conscienciológica.
        </Subtitle>
        
        <CTAButtons>
          {isAuthenticated ? (
            <CTAButton to="/dashboard" className="primary">
              Ir para Dashboard
            </CTAButton>
          ) : (
            <>
              <CTAButton to="/register" className="primary">
                Começar Agora
              </CTAButton>
              <CTAButton to="/login">
                Já tenho conta
              </CTAButton>
            </>
          )}
        </CTAButtons>
      </Hero>

      <Features>
        <FeatureCard>
          <FeatureIcon>📊</FeatureIcon>
          <FeatureTitle>Registro Simples</FeatureTitle>
          <FeatureText>
            Registre seus EVs com pontuação de 0 a 4. 
            Use sua ficha de papel durante o dia e depois 
            passe a limpo no site.
          </FeatureText>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🏆</FeatureIcon>
          <FeatureTitle>Rankings Competitivos</FeatureTitle>
          <FeatureText>
            Participe dos rankings diário, semanal, mensal 
            e anual. Compare seu progresso com outros 
            praticantes.
          </FeatureText>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🎖️</FeatureIcon>
          <FeatureTitle>Badges Conscienciológicas</FeatureTitle>
          <FeatureText>
            Conquiste badges com nomes da Conscienciologia 
            conforme você progride na prática dos EVs.
          </FeatureText>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>📈</FeatureIcon>
          <FeatureTitle>Estatísticas Detalhadas</FeatureTitle>
          <FeatureText>
            Acompanhe suas estatísticas, histórico de 
            progresso e tendências ao longo do tempo.
          </FeatureText>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>👤</FeatureIcon>
          <FeatureTitle>Anonimato</FeatureTitle>
          <FeatureText>
            Use apenas um apelido e avatar. Mantenha 
            sua privacidade enquanto participa da comunidade.
          </FeatureText>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🎁</FeatureIcon>
          <FeatureTitle>Prêmios Reais</FeatureTitle>
          <FeatureText>
            Os melhores colocados podem ganhar livros 
            e cursos de Conscienciologia como prêmios.
          </FeatureText>
        </FeatureCard>
      </Features>

      <Stats>
        <StatCard>
          <StatNumber>20</StatNumber>
          <StatLabel>EVs por dia</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>0-4</StatNumber>
          <StatLabel>Escala de pontuação</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>∞</StatNumber>
          <StatLabel>Possibilidades de crescimento</StatLabel>
        </StatCard>
      </Stats>
    </div>
  );
};

export default Home; 