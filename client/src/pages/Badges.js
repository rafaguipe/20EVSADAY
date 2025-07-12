import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const StatValue = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-transform: uppercase;
`;

const BadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const BadgeCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid ${props => props.earned ? '#4a8a4a' : '#4a4a4a'};
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.earned && `
    box-shadow: 0 0 20px rgba(74, 138, 74, 0.3);
  `}
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.earned ? '#6aaa6a' : '#6a6a6a'};
  }
`;

const BadgeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const BadgeIcon = styled.div`
  font-size: 48px;
  opacity: ${props => props.earned ? 1 : 0.3};
`;

const BadgeInfo = styled.div`
  flex: 1;
`;

const BadgeName = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 5px;
  text-transform: uppercase;
`;

const BadgeDescription = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  line-height: 1.4;
`;

const BadgeProgress = styled.div`
  margin-top: 15px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #1a1a1a;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.earned ? '#4a8a4a' : '#4a6a8a'};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-align: center;
`;

const EarnedBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #4a8a4a;
  color: #ffffff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const RecentBadges = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  backdrop-filter: blur(10px);
`;

const RecentBadgeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #4a4a4a;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RecentBadgeIcon = styled.div`
  font-size: 32px;
`;

const RecentBadgeInfo = styled.div`
  flex: 1;
`;

const RecentBadgeName = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 5px;
`;

const RecentBadgeDate = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
`;

const LoadingText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #6a6a6a;
  text-align: center;
  padding: 40px;
`;

const ErrorText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ff6b6b;
  text-align: center;
  padding: 40px;
`;

const Badges = () => {
  const [badgesData, setBadgesData] = useState(null);
  const [recentBadges, setRecentBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBadges();
    loadRecentBadges();
  }, []);

  const loadBadges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/badges/my');
      setBadgesData(response.data);
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
      setError('Erro ao carregar badges');
    }
    
    setLoading(false);
  };

  const loadRecentBadges = async () => {
    try {
      const response = await axios.get('/api/badges/recent');
      setRecentBadges(response.data.recent_badges);
    } catch (error) {
      console.error('Erro ao carregar badges recentes:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container>
        <Title>Badges</Title>
        <LoadingText>CARREGANDO BADGES...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Badges</Title>
        <ErrorText>{error}</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Badges</Title>
      
      {badgesData && (
        <StatsGrid>
          <StatCard>
            <StatValue>{badgesData.total_earned}</StatValue>
            <StatLabel>Badges Conquistadas</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{badgesData.total_available}</StatValue>
            <StatLabel>Total de Badges</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>
              {Math.round((badgesData.total_earned / badgesData.total_available) * 100)}%
            </StatValue>
            <StatLabel>Progresso</StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      <BadgesGrid>
        {badgesData?.all_badges?.map(badge => (
          <BadgeCard key={badge.id} earned={badge.earned}>
            {badge.earned && <EarnedBadge>Conquistada</EarnedBadge>}
            
            <BadgeHeader>
              <BadgeIcon earned={badge.earned}>{badge.icon}</BadgeIcon>
              <BadgeInfo>
                <BadgeName>{badge.name}</BadgeName>
                <BadgeDescription>{badge.description}</BadgeDescription>
              </BadgeInfo>
            </BadgeHeader>
            
            <BadgeProgress>
              <ProgressBar>
                <ProgressFill 
                  earned={badge.earned} 
                  percentage={badge.earned ? 100 : 0}
                />
              </ProgressBar>
              <ProgressText>
                {badge.earned ? 'Conquistada!' : 'Em progresso...'}
              </ProgressText>
            </BadgeProgress>
          </BadgeCard>
        ))}
      </BadgesGrid>

      <RecentBadges>
        <h2 style={{
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '16px',
          color: '#ffffff',
          marginBottom: '20px',
          textTransform: 'uppercase'
        }}>
          Badges Recentes
        </h2>
        
        {recentBadges.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#6a6a6a', 
            padding: '20px',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '12px'
          }}>
            Nenhuma badge conquistada ainda
          </div>
        ) : (
          recentBadges.map((badge, index) => (
            <RecentBadgeItem key={index}>
              <RecentBadgeIcon>{badge.icon}</RecentBadgeIcon>
              <RecentBadgeInfo>
                <RecentBadgeName>{badge.name}</RecentBadgeName>
                <RecentBadgeDate>
                  Conquistada em {formatDate(badge.earned_at)}
                </RecentBadgeDate>
              </RecentBadgeInfo>
            </RecentBadgeItem>
          ))
        )}
      </RecentBadges>
    </Container>
  );
};

export default Badges; 