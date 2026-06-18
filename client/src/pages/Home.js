import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { isFeatureEnabled } from '../utils/featureFlags';
import MascoteContest from '../components/MascoteContest';

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

const LogoImage = styled.img`
  height: 120px;
  width: auto;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    height: 80px;
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
  
  @media (max-width: 480px) {
    font-size: 18px;
    letter-spacing: 2px;
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
  
  @media (max-width: 480px) {
    font-size: 10px;
    line-height: 1.6;
    margin-bottom: 30px;
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
  
  @media (max-width: 768px) {
    padding: 25px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 15px;
  }
  
  &:hover {
    border-color: #6a6a6a;
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 40px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 32px;
    margin-bottom: 12px;
  }
`;

const FeatureTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 10px;
  }
`;

const FeatureText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 11px;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
    line-height: 1.4;
  }
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
  min-height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 12px 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 10px 15px;
    width: 100%;
  }
  
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
  
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const StatNumber = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 6px;
  }
`;

const StatLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 9px;
  }
  
  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

const AboutSection = styled.div`
  padding: 60px 20px;
  background: rgba(26, 26, 26, 0.9);
  border-top: 2px solid #4a4a4a;
`;

const AboutContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const AboutTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 40px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 25px;
  }
`;

const AboutCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 25px 20px;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 15px;
    margin-bottom: 20px;
  }
`;

const AboutCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const AboutCardLogo = styled.img`
  height: 60px;
  width: auto;
  
  @media (max-width: 768px) {
    height: 50px;
  }
  
  @media (max-width: 480px) {
    height: 40px;
  }
`;

const AboutCardTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const AboutCardText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;
  line-height: 1.6;
  white-space: pre-wrap;
  
  @media (max-width: 768px) {
    font-size: 11px;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
    line-height: 1.4;
  }
`;

// Estilos para o componente de progresso do próximo marco na Home
const MilestoneContainer = styled.div`
  background: rgba(26, 26, 26, 0.95);
  border: 2px solid #4a6a8a;
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  width: 100%;
  margin: 20px auto;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

const MilestoneTitle = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #4a6a8a;
  margin-bottom: 12px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 9px;
    margin-bottom: 10px;
  }
`;

const MilestoneProgressContainer = styled.div`
  margin-bottom: 12px;
`;

const MilestoneProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #2a2a2a;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

const MilestoneProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 6px;
  transition: width 0.5s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const MilestoneProgressText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffffff;
  text-align: center;
  margin-top: 6px;
  
  @media (max-width: 768px) {
    font-size: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 7px;
    margin-top: 4px;
  }
`;

const MilestoneCurrentTotal = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #4CAF50;
  text-align: center;
  font-weight: bold;
  margin-bottom:6px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 4px;
  }
`;

const MilestoneNext = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #666;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 7px;
  }
`;

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [gpcText, setGpcText] = useState('');
  const [liderareText, setLiderareText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Estados para o progresso do próximo marco
  const [totalEVS, setTotalEVS] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(1000);
  const [progress, setProgress] = useState(0);
  
  // Verificar se o concurso do mascote está habilitado
  const mascoteContestEnabled = isFeatureEnabled('MASCOTE_CONTEST', user?.user_metadata?.username, false);

  useEffect(() => {
    loadAboutContent();
    loadMilestoneProgress();
    
    // Atualizar progresso a cada 10 segundos
    const interval = setInterval(loadMilestoneProgress, 10000);
    
    // Escutar mudanças em tempo real
    const subscription = supabase
      .channel('evs_progress')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'evs' },
        () => {
          setTimeout(loadMilestoneProgress, 500);
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, []);

  const loadAboutContent = async () => {
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

  const loadMilestoneProgress = async () => {
    try {
      const { count, error } = await supabase
        .from('evs')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Erro ao buscar total de EVS:', error);
        return;
      }

      const total = count || 0;
      setTotalEVS(total);

      // Calcular próximo marco
      const currentMilestone = Math.floor(total / 1000) * 1000;
      const next = currentMilestone + 1000;
      setNextMilestone(next);

      // Calcular progresso
      const progressPercent = ((total - currentMilestone) / 1000) * 100;
      setProgress(Math.min(progressPercent, 100));
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  return (
    <div>
      <Hero>
        <Logo>
          <LogoImage src="/assets/boneco1.png" alt="Logo" />
        </Logo>
        
        {/* Componente de progresso do próximo marco */}
        {totalEVS >= 100 && (
          <MilestoneContainer>
            <MilestoneTitle>🎯 PRÓXIMO MARCO</MilestoneTitle>
            <MilestoneProgressContainer>
              <MilestoneProgressBar>
                <MilestoneProgressFill style={{ width: `${progress}%` }} />
              </MilestoneProgressBar>
              <MilestoneProgressText>
                {totalEVS.toLocaleString()} / {nextMilestone.toLocaleString()} EVS
              </MilestoneProgressText>
            </MilestoneProgressContainer>
            <MilestoneCurrentTotal>
              {totalEVS.toLocaleString()} EVS
            </MilestoneCurrentTotal>
            <MilestoneNext>
              Próximo: {nextMilestone.toLocaleString()} EVS
            </MilestoneNext>
          </MilestoneContainer>
        )}
        
        <Title>#20EVSADAY</Title>
        <Subtitle>
          Registre seus Estados Vibracionais de forma gamificada. 
          Acompanhe seu progresso, conquiste selos e participe do ranking 
          da comunidade conscienciológica.
        </Subtitle>
        
        <CTAButtons>
          {isAuthenticated ? (
            <CTAButton to="/dashboard" className="primary">
              Ir para Registro
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

      {/* Concurso do Mascote - INATIVADO - Sistema de votação implementado separadamente */}
      {/* {mascoteContestEnabled && isAuthenticated && (
        <MascoteContest />
      )} */}

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
          <FeatureTitle>Rankings Colaborativos</FeatureTitle>
          <FeatureText>
            Participe dos rankings diário, semanal, mensal 
            e anual. Incentive seus amigos evolutivos a fazerem mais EVs!
          </FeatureText>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🎖️</FeatureIcon>
          <FeatureTitle>Conquistas Conscienciológicas</FeatureTitle>
          <FeatureText>
            Conquiste selos com nomes da Conscienciologia 
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

      <AboutSection>
        <AboutContainer>
          <AboutTitle>Sobre</AboutTitle>
          
          <AboutCard>
            <AboutCardHeader>
              <AboutCardLogo src="/assets/logo_jogos_evolutivos.png" alt="GPC Jogos Evolutivos" />
              <AboutCardTitle>🎮 GPC Jogos Evolutivos</AboutCardTitle>
            </AboutCardHeader>
            <AboutCardText>{gpcText}</AboutCardText>
          </AboutCard>

          <AboutCard>
            <AboutCardHeader>
              <AboutCardLogo src="/assets/Liderare.png" alt="IC Liderare" />
              <AboutCardTitle>🏛️ IC Liderare</AboutCardTitle>
            </AboutCardHeader>
            <AboutCardText>{liderareText}</AboutCardText>
          </AboutCard>
        </AboutContainer>
      </AboutSection>
    </div>
  );
};

export default Home; 