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
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [userStats, setUserStats] = useState({
    total_badges: 0,
    total_evs: 0,
    average_score: 0,
    max_score: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBadges = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Carregar todos os badges disponíveis
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('id');

      if (badgesError) throw badgesError;

      // Carregar badges do usuário
      const { data: userBadgesData, error: userBadgesError } = await supabase
        .from('user_badges')
        .select(`
          awarded_at,
          badges!inner(*)
        `)
        .eq('user_id', user.id);

      if (userBadgesError) throw userBadgesError;

      // Carregar estatísticas do usuário
      const { data: userEVs, error: evsError } = await supabase
        .from('evs')
        .select('score, created_at')
        .eq('user_id', user.id);

      if (evsError) throw evsError;

      // Calcular estatísticas
      const total_evs = userEVs?.length || 0;
      const average_score = total_evs > 0 ? (userEVs.reduce((sum, ev) => sum + ev.score, 0) / total_evs).toFixed(1) : 0;
      const max_score = total_evs > 0 ? Math.max(...userEVs.map(ev => ev.score)) : 0;

      // Verificar quais badges o usuário conquistou
      const earnedBadges = userBadgesData?.map(ub => ub.badges.id) || [];
      
      // Verificar se o usuário é fundador (inscrito até 31/7/2025)
      const userProfile = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', user.id)
        .single();
      
      const isFounder = userProfile?.data?.created_at ? 
        new Date(userProfile.data.created_at) <= new Date('2025-07-31 23:59:59') : 
        false;
      
      const badgesWithProgress = allBadges?.map(badge => {
        let progress = 0;
        let current = 0;
        let target = 0;
        let earned = earnedBadges.includes(badge.id);

        switch (badge.name) {
          case 'Iniciante Consciencial':
            progress = total_evs > 0 ? 100 : 0;
            current = total_evs;
            target = 1;
            earned = total_evs > 0;
            break;
          case 'Persistente':
            // Verificar 7 dias consecutivos
            const consecutiveDays = calculateConsecutiveDays(userEVs);
            progress = Math.min((consecutiveDays / 7) * 100, 100);
            current = consecutiveDays;
            target = 7;
            earned = consecutiveDays >= 7;
            break;
          case 'Dedicado':
            // Verificar 30 dias consecutivos
            const consecutiveDays30 = calculateConsecutiveDays(userEVs);
            progress = Math.min((consecutiveDays30 / 30) * 100, 100);
            current = consecutiveDays30;
            target = 30;
            earned = consecutiveDays30 >= 30;
            break;
          case 'Mestre EV':
            progress = Math.min((total_evs / 100) * 100, 100);
            current = total_evs;
            target = 100;
            earned = total_evs >= 100;
            break;
          case 'Alto Vibracional':
            const maxScoreEVs = userEVs?.filter(ev => ev.score === 4).length || 0;
            progress = maxScoreEVs > 0 ? 100 : 0;
            current = maxScoreEVs;
            target = 1;
            earned = maxScoreEVs > 0;
            break;
          case 'Consistente':
            const avgScore = parseFloat(average_score);
            progress = avgScore >= 3 ? 100 : (avgScore / 3) * 100;
            current = avgScore;
            target = 3;
            earned = avgScore >= 3 && total_evs >= 10;
            break;
          case 'Pesquisador Consciencial':
            progress = Math.min((total_evs / 500) * 100, 100);
            current = total_evs;
            target = 500;
            earned = total_evs >= 500;
            break;
          case 'Líder Vibracional':
            // Simplificado - considerar como conquistado se for top 1 em qualquer período
            progress = 50; // Placeholder
            current = 1;
            target = 1;
            earned = false; // Será calculado dinamicamente
            break;
          case 'Fundador':
            // Verificar se o usuário se inscreveu até 31/7/2025
            earned = isFounder;
            progress = isFounder ? 100 : 0;
            current = isFounder ? 1 : 0;
            target = 1;
            break;
          default:
            progress = 0;
            current = 0;
            target = 1;
        }

        return {
          ...badge,
          progress,
          current,
          target,
          earned
        };
      }) || [];

      setBadges(badgesWithProgress);
      setUserBadges(userBadgesData || []);
      setUserStats({
        total_badges: earnedBadges.length,
        total_evs,
        average_score,
        max_score
      });

    } catch (error) {
      console.error('Erro ao carregar badges:', error);
      setError('Erro ao carregar badges');
    }
    
    setLoading(false);
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

  useEffect(() => {
    loadBadges();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Title>Badges</Title>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{userStats.total_badges}</StatValue>
          <StatLabel>Badges Conquistadas</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.total_evs}</StatValue>
          <StatLabel>Total de EVs</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.average_score}</StatValue>
          <StatLabel>Média Geral</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.max_score}</StatValue>
          <StatLabel>Pontuação Máxima</StatLabel>
        </StatCard>
      </StatsGrid>

      {loading && (
        <LoadingText>CARREGANDO BADGES...</LoadingText>
      )}

      {error && (
        <ErrorText>{error}</ErrorText>
      )}

      {!loading && !error && (
        <>
          <BadgesGrid>
            {badges.map(badge => (
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
                      percentage={badge.progress}
                    />
                  </ProgressBar>
                  <ProgressText>
                    {badge.current}/{badge.target} ({badge.progress.toFixed(0)}%)
                  </ProgressText>
                </BadgeProgress>
              </BadgeCard>
            ))}
          </BadgesGrid>

          <RecentBadges>
            <BadgeName style={{ marginBottom: '20px' }}>Badges Recentes</BadgeName>
            {userBadges.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6a6a6a', padding: '20px' }}>
                Nenhuma badge conquistada ainda
              </div>
            ) : (
              userBadges.slice(0, 5).map(userBadge => (
                <RecentBadgeItem key={userBadge.id}>
                  <RecentBadgeIcon>{userBadge.badges.icon}</RecentBadgeIcon>
                  <RecentBadgeInfo>
                    <RecentBadgeName>{userBadge.badges.name}</RecentBadgeName>
                    <RecentBadgeDate>{formatDate(userBadge.awarded_at)}</RecentBadgeDate>
                  </RecentBadgeInfo>
                </RecentBadgeItem>
              ))
            )}
          </RecentBadges>
        </>
      )}
    </Container>
  );
};

export default Badges; 