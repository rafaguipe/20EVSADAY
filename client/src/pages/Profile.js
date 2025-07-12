import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
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

// LoadingText component removed as it's not being used

const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const Profile = () => {
  const { user, updateAvatar } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadHistory();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/evs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get('/api/evs/history?days=7');
      setHistory(response.data.history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleAvatarChange = async (avatarId) => {
    setLoading(true);
    
    try {
      await updateAvatar(avatarId);
      toast.success('Avatar atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar avatar');
    }
    
    setLoading(false);
  };

  const getMaxValue = () => {
    if (!history.length) return 1;
    return Math.max(...history.map(day => day.total_points));
  };

  return (
    <Container>
      <Title>Perfil</Title>
      
      <Grid>
        <Card>
          <CardTitle>Informações do Usuário</CardTitle>
          
          <ProfileInfo>
            <Avatar>
              {avatars[user?.avatar_id - 1] || '👤'}
            </Avatar>
            <UserInfo>
              <Username>{user?.nickname}</Username>
              <Email>{user?.email}</Email>
            </UserInfo>
          </ProfileInfo>
          
          <AvatarSection>
            <CardTitle style={{ fontSize: '12px', marginBottom: '10px' }}>
              Alterar Avatar
            </CardTitle>
            <AvatarGrid>
              {avatars.map((avatar, index) => (
                <AvatarOption
                  key={index}
                  selected={user?.avatar_id === index + 1}
                  onClick={() => handleAvatarChange(index + 1)}
                  style={{ opacity: loading ? 0.5 : 1 }}
                >
                  {avatar}
                </AvatarOption>
              ))}
            </AvatarGrid>
          </AvatarSection>
        </Card>

        <Card>
          <CardTitle>Estatísticas Gerais</CardTitle>
          
          <StatsGrid>
            <StatCard>
              <StatValue>{stats?.general?.total_evs || 0}</StatValue>
              <StatLabel>Total EVs</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats?.general?.average_score || 0}</StatValue>
              <StatLabel>Média</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats?.general?.max_score || 0}</StatValue>
              <StatLabel>Máximo</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats?.general?.total_points || 0}</StatValue>
              <StatLabel>Pontos</StatLabel>
            </StatCard>
          </StatsGrid>
          
          <div style={{ marginTop: '20px' }}>
            <CardTitle style={{ fontSize: '12px', marginBottom: '10px' }}>
              Estatísticas por Período
            </CardTitle>
            <StatsGrid>
              <StatCard>
                <StatValue>{stats?.today?.evs || 0}</StatValue>
                <StatLabel>Hoje</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats?.week?.evs || 0}</StatValue>
                <StatLabel>Semana</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats?.month?.evs || 0}</StatValue>
                <StatLabel>Mês</StatLabel>
              </StatCard>
            </StatsGrid>
          </div>
        </Card>
      </Grid>

      <HistoryChart>
        <ChartTitle>Histórico dos Últimos 7 Dias</ChartTitle>
        
        {history.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#6a6a6a', 
            padding: '20px',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '12px'
          }}>
            Nenhum dado disponível
          </div>
        ) : (
          history.map((day, index) => {
            const maxValue = getMaxValue();
            const percentage = maxValue > 0 ? (day.total_points / maxValue) * 100 : 0;
            
            return (
              <ChartBar key={index}>
                <ChartLabel>
                  {new Date(day.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </ChartLabel>
                <ChartBarFill style={{ width: `${percentage}%` }} />
                <ChartValue>
                  {day.total_points} pts ({day.evs_count} EVs)
                </ChartValue>
              </ChartBar>
            );
          })
        )}
      </HistoryChart>
    </Container>
  );
};

export default Profile; 