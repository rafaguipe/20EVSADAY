import React, { useState, useEffect, useCallback } from 'react';
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

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 10px;
`;

const Tab = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  padding: 12px 20px;
  border: 2px solid #4a4a4a;
  background: ${props => props.active ? '#4a6a8a' : '#1a1a1a'};
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#6a8aaa' : '#4a4a4a'};
    border-color: #6a6a6a;
  }
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 10px 15px;
  }
`;

const LeaderboardCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  backdrop-filter: blur(10px);
`;

const LeaderboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #4a4a4a;
`;

const LeaderboardTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  text-transform: uppercase;
`;

const LeaderboardInfo = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-align: right;
`;

const RankingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #4a4a4a;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(74, 74, 74, 0.2);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.isTop3 && `
    background: rgba(74, 106, 138, 0.2);
    border-left: 4px solid #4a6a8a;
  `}
`;

const Rank = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  font-weight: bold;
  width: 50px;
  text-align: center;
  
  ${props => props.isTop3 && `
    color: #ffd700;
  `}
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: #4a4a4a;
  border: 2px solid #6a6a6a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 15px;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Username = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  font-weight: bold;
`;

const UserStats = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
`;

const Score = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
  text-align: right;
  min-width: 80px;
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

const EmptyText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;
  text-align: center;
  padding: 40px;
`;

const tabs = [
  { key: 'daily', label: 'Diário', endpoint: '/api/leaderboard/daily' },
  { key: 'weekly', label: 'Semanal', endpoint: '/api/leaderboard/weekly' },
  { key: 'monthly', label: 'Mensal', endpoint: '/api/leaderboard/monthly' },
  { key: 'yearly', label: 'Anual', endpoint: '/api/leaderboard/yearly' },
  { key: 'all-time', label: 'Todos os Tempos', endpoint: '/api/leaderboard/all-time' },
  { key: 'consistency', label: 'Consistência', endpoint: '/api/leaderboard/consistency' },
  { key: 'dedication', label: 'Dedicação', endpoint: '/api/leaderboard/dedication' }
];

const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(tabs.find(t => t.key === activeTab).endpoint);
      setLeaderboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
      setError('Erro ao carregar ranking');
    }
    
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const getTabInfo = () => {
    const tab = tabs.find(t => t.key === activeTab);
    if (!leaderboardData) return '';
    
    switch (activeTab) {
      case 'daily':
        return `Data: ${leaderboardData.date}`;
      case 'weekly':
        return `${leaderboardData.start_date} a ${leaderboardData.end_date}`;
      case 'monthly':
        return `${leaderboardData.start_date} a ${leaderboardData.end_date}`;
      case 'yearly':
        return `${leaderboardData.start_date} a ${leaderboardData.end_date}`;
      case 'consistency':
        return `Mínimo ${leaderboardData.min_evs} EVs`;
      default:
        return '';
    }
  };

  const getScoreDisplay = (user) => {
    switch (activeTab) {
      case 'consistency':
        return `${user.average_score} (${user.evs_count} EVs)`;
      case 'dedication':
        return `${user.evs_count} EVs`;
      default:
        return `${user.total_points} pts`;
    }
  };

  const getScoreLabel = () => {
    switch (activeTab) {
      case 'consistency':
        return 'Média';
      case 'dedication':
        return 'EVs';
      default:
        return 'Pontos';
    }
  };

  return (
    <Container>
      <Title>Ranking</Title>
      
      <TabContainer>
        {tabs.map(tab => (
          <Tab
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabContainer>

      <LeaderboardCard>
        <LeaderboardHeader>
          <LeaderboardTitle>
            {tabs.find(t => t.key === activeTab)?.label}
          </LeaderboardTitle>
          <LeaderboardInfo>
            {getTabInfo()}
          </LeaderboardInfo>
        </LeaderboardHeader>

        {loading && (
          <LoadingText>CARREGANDO RANKING...</LoadingText>
        )}

        {error && (
          <ErrorText>{error}</ErrorText>
        )}

        {!loading && !error && leaderboardData?.leaderboard?.length === 0 && (
          <EmptyText>Nenhum participante encontrado</EmptyText>
        )}

        {!loading && !error && leaderboardData?.leaderboard?.length > 0 && (
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '10px 15px',
              borderBottom: '1px solid #4a4a4a',
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '10px',
              color: '#6a6a6a',
              textTransform: 'uppercase'
            }}>
              <span>Rank</span>
              <span>Jogador</span>
              <span>{getScoreLabel()}</span>
            </div>
            
            {leaderboardData.leaderboard.map((user, index) => (
              <RankingItem key={index} isTop3={index < 3}>
                <Rank isTop3={index < 3}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : user.rank}
                </Rank>
                <Avatar>
                  {avatars[user.avatar_id - 1] || '👤'}
                </Avatar>
                <UserInfo>
                  <Username>{user.nickname}</Username>
                  <UserStats>
                    {user.evs_count} EVs • Média: {user.average_score}
                    {user.max_score && ` • Máx: ${user.max_score}`}
                  </UserStats>
                </UserInfo>
                <Score>{getScoreDisplay(user)}</Score>
              </RankingItem>
            ))}
          </>
        )}
      </LeaderboardCard>
    </Container>
  );
};

export default Leaderboard; 