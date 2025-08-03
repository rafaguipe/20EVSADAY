import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
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
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
  flex-wrap: wrap;
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
  
  &:hover {
    background: ${props => props.active ? '#6a8aaa' : '#4a4a4a'};
    border-color: #6a6a6a;
  }
  
  @media (max-width: 768px) {
    font-size: 8px;
    padding: 6px 12px;
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
  { key: 'daily', label: 'Diário' },
  { key: 'weekly', label: 'Semanal' },
  { key: 'monthly', label: 'Mensal' },
  { key: 'yearly', label: 'Anual' },
  { key: 'all-time', label: 'Todos os Tempos' },
  { key: '2025', label: '2025' }
];

const sortOptions = [
  { key: 'total_points', label: 'Pontos' },
  { key: 'evs_count', label: 'Número' },
  { key: 'average_score', label: 'Média' }
];

const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily');
  const [sortBy, setSortBy] = useState('total_points');
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

      // Primeiro, buscar todos os perfis de usuários para ter os apelidos e avatars
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url');

      const profilesMap = {};
      profiles?.forEach(profile => {
        profilesMap[profile.user_id] = {
          username: profile.username,
          avatar_url: profile.avatar_url
        };
      });

      switch (activeTab) {
        case 'daily':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const { data: dailyData } = await supabase
            .from('evs')
            .select('score, created_at, user_id')
            .gte('created_at', today.toISOString());
          
          if (dailyData && dailyData.length > 0) {
            const dailyStats = dailyData.reduce((acc, ev) => {
              const userId = ev.user_id;
              if (!acc[userId]) {
                acc[userId] = { total_points: 0, evs_count: 0, scores: [] };
              }
              acc[userId].total_points += ev.score;
              acc[userId].evs_count += 1;
              acc[userId].scores.push(ev.score);
              return acc;
            }, {});

            leaderboard = Object.entries(dailyStats)
              .map(([userId, stats]) => ({
                user_id: userId,
                nickname: profilesMap[userId]?.username || `Jogador ${userId.slice(0, 8)}`,
                avatar_url: profilesMap[userId]?.avatar_url || 'avatar_1.png',
                total_points: stats.total_points,
                evs_count: stats.evs_count,
                average_score: (stats.total_points / stats.evs_count).toFixed(1),
                max_score: Math.max(...stats.scores)
              }))
              .sort((a, b) => b.total_points - a.total_points);
          }
          info = `Data: ${today.toLocaleDateString('pt-BR')} • ${leaderboard.length} jogadores`;
          break;

        case 'weekly':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const { data: weeklyData } = await supabase
            .from('evs')
            .select('score, created_at, user_id')
            .gte('created_at', weekAgo.toISOString());
          
          if (weeklyData && weeklyData.length > 0) {
            const weeklyStats = weeklyData.reduce((acc, ev) => {
              const userId = ev.user_id;
              if (!acc[userId]) {
                acc[userId] = { total_points: 0, evs_count: 0, scores: [] };
              }
              acc[userId].total_points += ev.score;
              acc[userId].evs_count += 1;
              acc[userId].scores.push(ev.score);
              return acc;
            }, {});

            leaderboard = Object.entries(weeklyStats)
              .map(([userId, stats]) => ({
                user_id: userId,
                nickname: profilesMap[userId]?.username || `Jogador ${userId.slice(0, 8)}`,
                avatar_url: profilesMap[userId]?.avatar_url || 'avatar_1.png',
                total_points: stats.total_points,
                evs_count: stats.evs_count,
                average_score: (stats.total_points / stats.evs_count).toFixed(1),
                max_score: Math.max(...stats.scores)
              }))
              .sort((a, b) => b.total_points - a.total_points);
          }
          info = `${weekAgo.toLocaleDateString('pt-BR')} a ${new Date().toLocaleDateString('pt-BR')} • ${leaderboard.length} jogadores`;
          break;

        case 'monthly':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          const { data: monthlyData } = await supabase
            .from('evs')
            .select('score, created_at, user_id')
            .gte('created_at', monthAgo.toISOString());
          
          if (monthlyData && monthlyData.length > 0) {
            const monthlyStats = monthlyData.reduce((acc, ev) => {
              const userId = ev.user_id;
              if (!acc[userId]) {
                acc[userId] = { total_points: 0, evs_count: 0, scores: [] };
              }
              acc[userId].total_points += ev.score;
              acc[userId].evs_count += 1;
              acc[userId].scores.push(ev.score);
              return acc;
            }, {});

            leaderboard = Object.entries(monthlyStats)
              .map(([userId, stats]) => ({
                user_id: userId,
                nickname: profilesMap[userId]?.username || `Jogador ${userId.slice(0, 8)}`,
                avatar_url: profilesMap[userId]?.avatar_url || 'avatar_1.png',
                total_points: stats.total_points,
                evs_count: stats.evs_count,
                average_score: (stats.total_points / stats.evs_count).toFixed(1),
                max_score: Math.max(...stats.scores)
              }))
              .sort((a, b) => b.total_points - a.total_points);
          }
          info = `${monthAgo.toLocaleDateString('pt-BR')} a ${new Date().toLocaleDateString('pt-BR')} • ${leaderboard.length} jogadores`;
          break;

        case 'all-time':
          const { data: allTimeData } = await supabase
            .from('evs')
            .select('score, created_at, user_id');
          
          if (allTimeData && allTimeData.length > 0) {
            const allTimeStats = allTimeData.reduce((acc, ev) => {
              const userId = ev.user_id;
              if (!acc[userId]) {
                acc[userId] = { total_points: 0, evs_count: 0, scores: [] };
              }
              acc[userId].total_points += ev.score;
              acc[userId].evs_count += 1;
              acc[userId].scores.push(ev.score);
              return acc;
            }, {});

            leaderboard = Object.entries(allTimeStats)
              .map(([userId, stats]) => ({
                user_id: userId,
                nickname: profilesMap[userId]?.username || `Jogador ${userId.slice(0, 8)}`,
                avatar_url: profilesMap[userId]?.avatar_url || 'avatar_1.png',
                total_points: stats.total_points,
                evs_count: stats.evs_count,
                average_score: (stats.total_points / stats.evs_count).toFixed(1),
                max_score: Math.max(...stats.scores)
              }))
              .sort((a, b) => b.total_points - a.total_points);
          }
          info = `Todos os tempos • ${leaderboard.length} jogadores`;
          break;

        case 'yearly':
          const yearStart = new Date();
          yearStart.setMonth(0, 1);
          yearStart.setHours(0, 0, 0, 0);
          const { data: yearlyData } = await supabase
            .from('evs')
            .select('score, created_at, user_id')
            .gte('created_at', yearStart.toISOString());
          
          if (yearlyData && yearlyData.length > 0) {
            const yearlyStats = yearlyData.reduce((acc, ev) => {
              const userId = ev.user_id;
              if (!acc[userId]) {
                acc[userId] = { total_points: 0, evs_count: 0, scores: [] };
              }
              acc[userId].total_points += ev.score;
              acc[userId].evs_count += 1;
              acc[userId].scores.push(ev.score);
              return acc;
            }, {});

            leaderboard = Object.entries(yearlyStats)
              .map(([userId, stats]) => ({
                user_id: userId,
                nickname: profilesMap[userId]?.username || `Jogador ${userId.slice(0, 8)}`,
                avatar_url: profilesMap[userId]?.avatar_url || 'avatar_1.png',
                total_points: stats.total_points,
                evs_count: stats.evs_count,
                average_score: (stats.total_points / stats.evs_count).toFixed(1),
                max_score: Math.max(...stats.scores)
              }));
          }
          info = `${yearStart.getFullYear()} • ${leaderboard.length} jogadores`;
          break;

        case '2025':
          const year2025Start = new Date('2025-01-01T00:00:00.000Z');
          const { data: year2025Data } = await supabase
            .from('evs')
            .select('score, created_at, user_id')
            .gte('created_at', year2025Start.toISOString());
          
          if (year2025Data && year2025Data.length > 0) {
            const year2025Stats = year2025Data.reduce((acc, ev) => {
              const userId = ev.user_id;
              if (!acc[userId]) {
                acc[userId] = { total_points: 0, evs_count: 0, scores: [] };
              }
              acc[userId].total_points += ev.score;
              acc[userId].evs_count += 1;
              acc[userId].scores.push(ev.score);
              return acc;
            }, {});

            leaderboard = Object.entries(year2025Stats)
              .map(([userId, stats]) => ({
                user_id: userId,
                nickname: profilesMap[userId]?.username || `Jogador ${userId.slice(0, 8)}`,
                avatar_url: profilesMap[userId]?.avatar_url || 'avatar_1.png',
                total_points: stats.total_points,
                evs_count: stats.evs_count,
                average_score: (stats.total_points / stats.evs_count).toFixed(1),
                max_score: Math.max(...stats.scores)
              }));
          }
          info = `2025 • ${leaderboard.length} jogadores`;
          break;

        case 'consistency':
          const { data: consistencyData } = await supabase
            .from('evs')
            .select('score, created_at, user_id');
          
          if (consistencyData && consistencyData.length > 0) {
            const consistencyStats = consistencyData.reduce((acc, ev) => {
              const userId = ev.user_id;
              if (!acc[userId]) {
                acc[userId] = { total_points: 0, evs_count: 0, scores: [] };
              }
              acc[userId].total_points += ev.score;
              acc[userId].evs_count += 1;
              acc[userId].scores.push(ev.score);
              return acc;
            }, {});

            leaderboard = Object.entries(consistencyStats)
              .filter(([_, stats]) => stats.evs_count >= 10) // Mínimo 10 EVs
              .map(([userId, stats]) => ({
                user_id: userId,
                nickname: profilesMap[userId]?.username || `Jogador ${userId.slice(0, 8)}`,
                avatar_url: profilesMap[userId]?.avatar_url || 'avatar_1.png',
                average_score: (stats.total_points / stats.evs_count).toFixed(1),
                evs_count: stats.evs_count,
                total_points: stats.total_points
              }))
              .sort((a, b) => parseFloat(b.average_score) - parseFloat(a.average_score));
          }
          info = `Mínimo 10 EVs • ${leaderboard.length} jogadores`;
          break;

        case 'dedication':
          const { data: dedicationData } = await supabase
            .from('evs')
            .select('score, created_at, user_id');
          
          if (dedicationData && dedicationData.length > 0) {
            const dedicationStats = dedicationData.reduce((acc, ev) => {
              const userId = ev.user_id;
              if (!acc[userId]) {
                acc[userId] = { total_points: 0, evs_count: 0, scores: [] };
              }
              acc[userId].total_points += ev.score;
              acc[userId].evs_count += 1;
              acc[userId].scores.push(ev.score);
              return acc;
            }, {});

            leaderboard = Object.entries(dedicationStats)
              .map(([userId, stats]) => ({
                user_id: userId,
                nickname: profilesMap[userId]?.username || `Jogador ${userId.slice(0, 8)}`,
                avatar_url: profilesMap[userId]?.avatar_url || 'avatar_1.png',
                evs_count: stats.evs_count,
                average_score: (stats.total_points / stats.evs_count).toFixed(1),
                total_points: stats.total_points
              }))
              .sort((a, b) => b.evs_count - a.evs_count);
          }
          info = `Mais EVs registrados • ${leaderboard.length} jogadores`;
          break;
      }

      // Aplicar ordenação
      if (leaderboard.length > 0) {
        leaderboard.sort((a, b) => {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'evs_count':
              aValue = a.evs_count;
              bValue = b.evs_count;
              break;
            case 'average_score':
              aValue = parseFloat(a.average_score);
              bValue = parseFloat(b.average_score);
              break;
            case 'total_points':
            default:
              aValue = a.total_points;
              bValue = b.total_points;
              break;
          }
          
          return bValue - aValue;
        });
      }

      setLeaderboardData({ leaderboard, info });
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
      setError('Erro ao carregar ranking');
    }
    
    setLoading(false);
  }, [activeTab, user]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard, sortBy]);

  const getScoreDisplay = (user) => {
    switch (sortBy) {
      case 'evs_count':
        return `${user.evs_count} EVs`;
      case 'average_score':
        return `${user.average_score}`;
      case 'total_points':
      default:
        return `${user.total_points} pts`;
    }
  };

  const getScoreLabel = () => {
    switch (sortBy) {
      case 'evs_count':
        return 'Número';
      case 'average_score':
        return 'Média';
      case 'total_points':
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

      <FilterContainer>
        {sortOptions.map(option => (
          <FilterButton
            key={option.key}
            active={sortBy === option.key}
            onClick={() => setSortBy(option.key)}
          >
            {option.label}
          </FilterButton>
        ))}
      </FilterContainer>

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
              <span>{getScoreLabel()}</span>
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