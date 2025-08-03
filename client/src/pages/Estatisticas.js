import React, { useState, useEffect } from 'react';
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

const ProgressSection = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
`;

const ProgressTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: #1a1a1a;
  border: 2px solid #4a4a4a;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4a8a4a 0%, #6aaa6a 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }
`;

const ProgressText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;
  text-align: center;
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

const Estatisticas = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    total_evs: 0,
    total_points: 0,
    average_score: 0,
    max_score: 0,
    consecutive_days: 0,
    total_badges: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Carregar EVs do usuário
      const { data: userEVs, error: evsError } = await supabase
        .from('evs')
        .select('score, created_at')
        .eq('user_id', user.id);

      if (evsError) throw evsError;

      // Carregar badges do usuário
      const { data: userBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      if (badgesError) throw badgesError;

      // Carregar todas as badges disponíveis para calcular dinamicamente
      const { data: allBadges, error: allBadgesError } = await supabase
        .from('badges')
        .select('*');

      if (allBadgesError) throw allBadgesError;

      // Calcular estatísticas
      const total_evs = userEVs?.length || 0;
      const total_points = userEVs?.reduce((sum, ev) => sum + ev.score, 0) || 0;
      const average_score = total_evs > 0 ? (total_points / total_evs).toFixed(1) : 0;
      const max_score = total_evs > 0 ? Math.max(...userEVs.map(ev => ev.score)) : 0;
      


      // Calcular dias consecutivos
      const consecutiveDays = calculateConsecutiveDays(userEVs);
      
      // Recalcular badges com os dias consecutivos
      const earnedBadges = allBadges?.filter(badge => {
        const userBadgeIds = userBadges?.map(ub => ub.badge_id) || [];
        
        // Se já tem a badge no banco, considera como conquistada
        if (userBadgeIds.includes(badge.id)) {
          return true;
        }
        
        // Verificar badges calculadas dinamicamente
        switch (badge.name) {
          case 'first_ev':
            return total_evs >= 1;
          case 'persistente':
            return consecutiveDays >= 7;
          case 'determinado':
            return consecutiveDays >= 14;
          case 'focado':
            return consecutiveDays >= 30;
          case 'milestone_1000_points':
            return total_points >= 1000;
          case 'milestone_2000_points':
            return total_points >= 2000;
          case 'milestone_3000_points':
            return total_points >= 3000;
          case 'milestone_4000_points':
            return total_points >= 4000;
          case 'milestone_5000_points':
            return total_points >= 5000;
          default:
            return false;
        }
      }) || [];
      
      const total_badges = earnedBadges.length;

      setUserStats({
        total_evs,
        total_points,
        average_score,
        max_score,
        consecutive_days: consecutiveDays,
        total_badges
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError('Erro ao carregar estatísticas');
    }
    
    setLoading(false);
  };

  const calculateConsecutiveDays = (evs) => {
    if (!evs || evs.length === 0) return 0;
    
    const dates = [...new Set(evs.map(ev => new Date(ev.created_at).toDateString()))].sort((a, b) => new Date(a) - new Date(b));
    
    if (dates.length === 0) return 0;
    if (dates.length === 1) return 1;
    
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    let prevDate = null;
    
    for (const dateStr of dates) {
      const currDate = new Date(dateStr);
      
      if (prevDate === null) {
        currentConsecutive = 1;
      } else {
        const prevUTC = Date.UTC(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
        const currUTC = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
        const diffDays = (currUTC - prevUTC) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentConsecutive++;
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        } else {
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
          currentConsecutive = 1;
        }
      }
      
      prevDate = currDate;
    }
    
    maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    return maxConsecutive;
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  return (
    <Container>
      <Title>Estatísticas</Title>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{userStats.total_evs}</StatValue>
          <StatLabel>Total de EVs</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.total_points}</StatValue>
          <StatLabel>Total de Pontos</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.average_score}</StatValue>
          <StatLabel>Média Geral</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.max_score}</StatValue>
          <StatLabel>Pontuação Máxima</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.consecutive_days}</StatValue>
          <StatLabel>Dias Consecutivos</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.total_badges}</StatValue>
          <StatLabel>Selos Conquistados</StatLabel>
        </StatCard>
      </StatsGrid>

      {loading && (
        <LoadingText>CARREGANDO ESTATÍSTICAS...</LoadingText>
      )}

      {error && (
        <ErrorText>{error}</ErrorText>
      )}

      {!loading && !error && (
        <>
          <ProgressSection>
            <ProgressTitle>Progresso Diário</ProgressTitle>
            <ProgressBar>
              <ProgressFill percentage={Math.min((userStats.total_evs / 20) * 100, 100)} />
            </ProgressBar>
            <ProgressText>
              {userStats.total_evs}/20 EVs ({Math.min((userStats.total_evs / 20) * 100, 100).toFixed(0)}%)
            </ProgressText>
          </ProgressSection>

          <ProgressSection>
            <ProgressTitle>Progresso de Pontos</ProgressTitle>
            <ProgressBar>
              <ProgressFill percentage={Math.min((userStats.total_points / 5000) * 100, 100)} />
            </ProgressBar>
            <ProgressText>
              {userStats.total_points}/5000 pontos ({Math.min((userStats.total_points / 5000) * 100, 100).toFixed(0)}%)
            </ProgressText>
          </ProgressSection>
        </>
      )}
    </Container>
  );
};

export default Estatisticas; 