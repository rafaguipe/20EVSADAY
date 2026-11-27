import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 20px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }
`;

const FilterButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 8px 15px;
  border: 2px solid #4a4a4a;
  background: ${props => props.active ? '#4a6a8a' : '#1a1a1a'};
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  min-height: 48px;
  min-width: 48px;
  
  &:hover {
    background: ${props => props.active ? '#6a8aaa' : '#4a4a4a'};
    border-color: #6a6a6a;
  }
  
  @media (max-width: 768px) {
    font-size: 8px;
    padding: 6px 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 8px;
    padding: 10px 15px;
    width: 100%;
  }
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
  min-height: 48px;
  min-width: 48px;
  
  &:hover {
    background: ${props => props.active ? '#6a8aaa' : '#4a4a4a'};
    border-color: #6a6a6a;
  }
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 10px 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 9px;
    padding: 12px 15px;
    width: 100%;
  }
`;

const LeaderboardCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const LeaderboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #4a4a4a;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 15px;
    padding-bottom: 12px;
  }
`;

const LeaderboardTitle = styled.h2`
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

const LeaderboardInfo = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-align: right;
  
  @media (max-width: 768px) {
    font-size: 9px;
  }
  
  @media (max-width: 480px) {
    font-size: 8px;
    text-align: left;
  }
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
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }
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
  
  @media (max-width: 768px) {
    font-size: 16px;
    width: 40px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    width: 35px;
  }
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
  
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 18px;
    margin: 0 12px;
  }
  
  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    font-size: 16px;
    margin: 0 8px;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0; /* Permite que o texto quebre */
  
  @media (max-width: 480px) {
    gap: 3px;
  }
`;

const Username = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const UserStats = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  
  @media (max-width: 768px) {
    font-size: 9px;
  }
  
  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

const Score = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
  text-align: right;
  min-width: 80px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    min-width: 70px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    min-width: 60px;
  }
`;

const LoadingText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #6a6a6a;
  text-align: center;
  padding: 40px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
    padding: 20px;
  }
`;

const ErrorText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ff6b6b;
  text-align: center;
  padding: 40px;
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
    padding: 20px;
  }
`;

const EmptyText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;
  text-align: center;
  padding: 40px;
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
    padding: 20px;
  }
`;

const tabs = [
  { key: 'daily', label: 'Diário' },
  { key: 'all-time', label: 'Todos os Tempos' }
];

const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLeaderboard = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      let leaderboard = [];
      let info = '';

      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const allTime = activeTab === 'all-time';
      const { data: rows, error: rankingError } = await supabase.rpc(
        'get_ev_leaderboard', { p_start: allTime ? null : dayStart.toISOString() }
      );
      if (rankingError) throw rankingError;
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles').select('user_id, username, avatar_url');
      if (profilesError) throw profilesError;
      const profilesMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
      leaderboard = (rows || []).map(row => ({
        ...row,
        nickname: profilesMap[row.user_id]?.username || 'Jogador ' + row.user_id.slice(0, 8),
        avatar_url: profilesMap[row.user_id]?.avatar_url || 'avatar_1.png',
        total_points: Number(row.total_points),
        evs_count: Number(row.evs_count),
        average_score: Number(row.average_score).toFixed(1)
      }));
      info = (allTime ? 'Todos os tempos' : 'Data: ' + dayStart.toLocaleDateString('pt-BR'))
        + ' • ' + leaderboard.length + ' jogadores';

      setLeaderboardData({ leaderboard, info });
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
      setError('Erro ao carregar ranking');
    }
    
    setLoading(false);
  }, [activeTab, user]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

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
            {leaderboardData?.info || ''}
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
              <span>EVs</span>
            </div>
            
            {leaderboardData.leaderboard.map((user, index) => (
              <RankingItem key={index} isTop3={index < 3}>
                <Rank isTop3={index < 3}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </Rank>
                <Avatar>
                  {(() => {
                    const avatarMatch = user.avatar_url?.match(/avatar_(\d+)\.png/);
                    const avatarId = avatarMatch ? parseInt(avatarMatch[1]) : 1;
                    return avatars[avatarId - 1] || avatars[0];
                  })()}
                </Avatar>
                <UserInfo>
                  <Username>{user.nickname}</Username>
                  <UserStats>
                    {user.evs_count} EVs • Média: {user.average_score}
                    {user.max_score && ` • Máx: ${user.max_score}`}
                  </UserStats>
                </UserInfo>
                <Score>{user.evs_count} EVs</Score>
              </RankingItem>
            ))}
          </>
        )}
      </LeaderboardCard>
    </Container>
  );
};

export default Leaderboard; 
