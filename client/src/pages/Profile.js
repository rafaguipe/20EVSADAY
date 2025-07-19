import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  backdrop-filter: blur(10px);
`;

const CardTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: #4a4a4a;
  border: 3px solid #6a6a6a;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 8px;
`;

const Email = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;
`;

const AvatarSection = styled.div`
  margin-top: 20px;
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 15px;
`;

const AvatarOption = styled.div`
  width: 60px;
  height: 60px;
  border: 3px solid ${props => props.selected ? '#4a6a8a' : '#4a4a4a'};
  background: #1a1a1a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6a6a6a;
    transform: scale(1.05);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const StatValue = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #6a6a6a;
  text-transform: uppercase;
`;

const HistoryChart = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
  margin-top: 20px;
`;

const ChartTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const ChartBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const ChartLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffffff;
  width: 80px;
  min-width: 80px;
`;

const ChartBarFill = styled.div`
  height: 20px;
  background: #4a6a8a;
  border-radius: 4px;
  margin: 0 10px;
  min-width: 20px;
  transition: width 0.3s ease;
`;

const ChartValue = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  min-width: 60px;
  text-align: right;
`;

const LoadingText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #6a6a6a;
  text-align: center;
  padding: 40px;
`;

const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const Profile = () => {
  const { user, updateAvatar } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    total_evs: 0,
    average_score: 0,
    max_score: 0,
    min_score: 0,
    consecutive_days: 0,
    total_points: 0
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadHistory();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data: evs, error } = await supabase
        .from('evs')
        .select('score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (evs && evs.length > 0) {
        const scores = evs.map(ev => ev.score);
        const total_evs = evs.length;
        const total_points = scores.reduce((sum, score) => sum + score, 0);
        const average_score = (total_points / total_evs).toFixed(1);
        const max_score = Math.max(...scores);
        const min_score = Math.min(...scores);
        const consecutive_days = calculateConsecutiveDays(evs);

        setStats({
          total_evs,
          average_score,
          max_score,
          min_score,
          consecutive_days,
          total_points
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('evs')
        .select('score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Agrupar por data
      const groupedByDate = data?.reduce((acc, ev) => {
        const date = new Date(ev.created_at).toDateString();
        if (!acc[date]) {
          acc[date] = { count: 0, total_score: 0 };
        }
        acc[date].count += 1;
        acc[date].total_score += ev.score;
        return acc;
      }, {});

      const historyData = Object.entries(groupedByDate || {})
        .map(([date, data]) => ({
          date: new Date(date),
          count: data.count,
          average: (data.total_score / data.count).toFixed(1)
        }))
        .sort((a, b) => b.date - a.date)
        .slice(0, 7); // Últimos 7 dias

      setHistory(historyData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const calculateConsecutiveDays = (evs) => {
    if (!evs || evs.length === 0) return 0;
    
    const dates = [...new Set(evs.map(ev => new Date(ev.created_at).toDateString()))].sort();
    let maxConsecutive = 0;
    let currentConsecutive = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentConsecutive++;
      } else {
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        currentConsecutive = 1;
      }
    }
    
    return Math.max(maxConsecutive, currentConsecutive);
  };

  const handleAvatarChange = async (avatarId) => {
    setLoading(true);
    try {
      const result = await updateAvatar(avatarId);
      if (result.success) {
        setProfile(prev => ({ ...prev, avatar_url: `avatar_${avatarId}.png` }));
      }
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
    }
    setLoading(false);
  };

  const getMaxValue = () => {
    if (history.length === 0) return 1;
    return Math.max(...history.map(h => h.count));
  };

  const getCurrentAvatarId = () => {
    if (!profile?.avatar_url) return 1;
    const match = profile.avatar_url.match(/avatar_(\d+)\.png/);
    return match ? parseInt(match[1]) : 1;
  };

  if (!user) {
    return (
      <Container>
        <LoadingText>CARREGANDO PERFIL...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Perfil</Title>
      
      <Grid>
        <Card>
          <CardTitle>Informações</CardTitle>
          
          <ProfileInfo>
            <Avatar>
              {avatars[getCurrentAvatarId() - 1] || '👤'}
            </Avatar>
            <UserInfo>
              <Username>{profile?.username || user.email}</Username>
              <Email>{user.email}</Email>
            </UserInfo>
          </ProfileInfo>

          <AvatarSection>
            <CardTitle style={{ fontSize: '12px', marginBottom: '10px' }}>
              Escolher Avatar
            </CardTitle>
            <AvatarGrid>
              {avatars.map((avatar, index) => (
                <AvatarOption
                  key={index}
                  selected={getCurrentAvatarId() === index + 1}
                  onClick={() => handleAvatarChange(index + 1)}
                  disabled={loading}
                >
                  {avatar}
                </AvatarOption>
              ))}
            </AvatarGrid>
          </AvatarSection>
        </Card>

        <Card>
          <CardTitle>Estatísticas</CardTitle>
          
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.total_evs}</StatValue>
              <StatLabel>Total de EVs</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.average_score}</StatValue>
              <StatLabel>Média Geral</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.max_score}</StatValue>
              <StatLabel>Pontuação Máxima</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.min_score}</StatValue>
              <StatLabel>Pontuação Mínima</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.consecutive_days}</StatValue>
              <StatLabel>Dias Consecutivos</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.total_points}</StatValue>
              <StatLabel>Total de Pontos</StatLabel>
            </StatCard>
          </StatsGrid>

          <HistoryChart>
            <ChartTitle>Histórico dos Últimos 7 Dias</ChartTitle>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6a6a6a', padding: '20px' }}>
                Nenhum EV registrado ainda
              </div>
            ) : (
              history.map((day, index) => (
                <ChartBar key={index}>
                  <ChartLabel>
                    {day.date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </ChartLabel>
                  <ChartBarFill 
                    style={{ 
                      width: `${(day.count / getMaxValue()) * 200}px` 
                    }} 
                  />
                  <ChartValue>
                    {day.count} EVs (média: {day.average})
                  </ChartValue>
                </ChartBar>
              ))
            )}
          </HistoryChart>
        </Card>
      </Grid>
    </Container>
  );
};

export default Profile; 