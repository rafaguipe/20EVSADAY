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
          case 'Mestre Diário':
            // Verificar se já fez 20 EVs em um dia
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEVs = userEVs?.filter(ev => new Date(ev.created_at) >= today) || [];
            const maxDailyEVs = Math.max(...Object.values(
              userEVs?.reduce((acc, ev) => {
                const date = new Date(ev.created_at).toDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
              }, {}) || {}
            ));
            earned = maxDailyEVs >= 20;
            progress = Math.min((maxDailyEVs / 20) * 100, 100);
            current = maxDailyEVs;
            target = 20;
            break;
          case 'Fundador':
            // Verificar se o usuário se inscreveu até 31/7/2025
            earned = isFounder;
            progress = isFounder ? 100 : 0;
            current = isFounder ? 1 : 0;
            target = 1;
            break;
          case 'Líder 4 Anos de Fundação':
            // Verificar se registrou EVs no período de fundação (1/7/2025 a 31/7/2025)
            const foundationStart = new Date('2025-07-01T00:00:00');
            const foundationEnd = new Date('2025-07-31T23:59:59');
            const foundationEVs = userEVs?.filter(ev => {
              const evDate = new Date(ev.created_at);
              return evDate >= foundationStart && evDate <= foundationEnd;
            }) || [];
            earned = foundationEVs.length > 0;
            progress = earned ? 100 : 0;
            current = foundationEVs.length;
            target = 1; // Apenas 1 EV no período já é suficiente
            break;
          // Novos badges - EVs em um único dia
          case 'Maratonista EV':
            const maxDailyEVs30 = Math.max(...Object.values(
              userEVs?.reduce((acc, ev) => {
                const date = new Date(ev.created_at).toDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
              }, {}) || {}
            ));
            earned = maxDailyEVs30 >= 30;
            progress = Math.min((maxDailyEVs30 / 30) * 100, 100);
            current = maxDailyEVs30;
            target = 30;
            break;
          case 'Ultra Maratonista EV':
            const maxDailyEVs40 = Math.max(...Object.values(
              userEVs?.reduce((acc, ev) => {
                const date = new Date(ev.created_at).toDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
              }, {}) || {}
            ));
            earned = maxDailyEVs40 >= 40;
            progress = Math.min((maxDailyEVs40 / 40) * 100, 100);
            current = maxDailyEVs40;
            target = 40;
            break;
          case 'Mega Maratonista EV':
            const maxDailyEVs50 = Math.max(...Object.values(
              userEVs?.reduce((acc, ev) => {
                const date = new Date(ev.created_at).toDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
              }, {}) || {}
            ));
            earned = maxDailyEVs50 >= 50;
            progress = Math.min((maxDailyEVs50 / 50) * 100, 100);
            current = maxDailyEVs50;
            target = 50;
            break;
          // Novos badges - Total de EVs
          case 'Mestre Consciencial':
            progress = Math.min((total_evs / 500) * 100, 100);
            current = total_evs;
            target = 500;
            earned = total_evs >= 500;
            break;
          case 'Sábio Consciencial':
            progress = Math.min((total_evs / 1000) * 100, 100);
            current = total_evs;
            target = 1000;
            earned = total_evs >= 1000;
            break;
          // Novos badges - Dias consecutivos
          case 'Mestre da Persistência':
            const consecutiveDays90 = calculateConsecutiveDays(userEVs);
            progress = Math.min((consecutiveDays90 / 90) * 100, 100);
            current = consecutiveDays90;
            target = 90;
            earned = consecutiveDays90 >= 90;
            break;
          case 'Semi-Anual Consciencial':
            const consecutiveDays180 = calculateConsecutiveDays(userEVs);
            progress = Math.min((consecutiveDays180 / 180) * 100, 100);
            current = consecutiveDays180;
            target = 180;
            earned = consecutiveDays180 >= 180;
            break;
                     case 'Anual Consciencial':
             const consecutiveDays360 = calculateConsecutiveDays(userEVs);
             progress = Math.min((consecutiveDays360 / 360) * 100, 100);
             current = consecutiveDays360;
             target = 360;
             earned = consecutiveDays360 >= 360;
             break;
           // Novos badges - Milestones de pontos
           case 'milestone_1000_points':
             const totalPoints = userEVs?.reduce((sum, ev) => sum + ev.score, 0) || 0;
             progress = Math.min((totalPoints / 1000) * 100, 100);
             current = totalPoints;
             target = 1000;
             earned = totalPoints >= 1000;
             break;
           case 'milestone_2000_points':
             const totalPoints2k = userEVs?.reduce((sum, ev) => sum + ev.score, 0) || 0;
             progress = Math.min((totalPoints2k / 2000) * 100, 100);
             current = totalPoints2k;
             target = 2000;
             earned = totalPoints2k >= 2000;
             break;
           case 'milestone_3000_points':
             const totalPoints3k = userEVs?.reduce((sum, ev) => sum + ev.score, 0) || 0;
             progress = Math.min((totalPoints3k / 3000) * 100, 100);
             current = totalPoints3k;
             target = 3000;
             earned = totalPoints3k >= 3000;
             break;
           case 'milestone_4000_points':
             const totalPoints4k = userEVs?.reduce((sum, ev) => sum + ev.score, 0) || 0;
             progress = Math.min((totalPoints4k / 4000) * 100, 100);
             current = totalPoints4k;
             target = 4000;
             earned = totalPoints4k >= 4000;
             break;
                     case 'milestone_5000_points':
            const totalPoints5k = userEVs?.reduce((sum, ev) => sum + ev.score, 0) || 0;
            progress = Math.min((totalPoints5k / 5000) * 100, 100);
            current = totalPoints5k;
            target = 5000;
            earned = totalPoints5k >= 5000;
            break;
          case 'experimento_grupal_1':
            // Verificar se fez EV entre 11h e 12h do dia 6/8/2025 (horário de Brasília)
            const experimentDate = new Date('2025-08-06T11:00:00-03:00');
            const experimentEndDate = new Date('2025-08-06T12:00:00-03:00');
            const hasExperimentEV = userEVs?.some(ev => {
              const evDate = new Date(ev.created_at);
              return evDate >= experimentDate && evDate < experimentEndDate;
            }) || false;
            progress = hasExperimentEV ? 100 : 0;
            current = hasExperimentEV ? 1 : 0;
            target = 1;
            earned = hasExperimentEV;
            break;
          case 'Janeiro 2026':
            // Verificar se fez pelo menos 1 EV em janeiro de 2026
            const january2026Start = new Date('2026-01-01T00:00:00Z');
            const january2026End = new Date('2026-02-01T00:00:00Z');
            const january2026EVs = userEVs?.filter(ev => {
              const evDate = new Date(ev.created_at);
              return evDate >= january2026Start && evDate < january2026End;
            }) || [];
            earned = january2026EVs.length >= 1 || earnedBadges.includes(badge.id);
            progress = earned ? 100 : 0;
            current = january2026EVs.length >= 1 ? 1 : 0;
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
             // Calcular dias consecutivos para o indicador
       const consecutiveDays = calculateConsecutiveDays(userEVs);
       
       
       
               // Contar badges realmente conquistadas (incluindo as calculadas no frontend)
        const totalEarnedBadges = badgesWithProgress.filter(b => b.earned).length;
        
        setUserStats({
          total_badges: totalEarnedBadges,
          total_evs,
          average_score,
          max_score,
          consecutive_days: consecutiveDays
        });

    } catch (error) {
      console.error('Erro ao carregar badges:', error);
      setError('Erro ao carregar badges');
    }
    
    setLoading(false);
  };

  const calculateConsecutiveDays = (evs) => {
    if (!evs || evs.length === 0) return 0;
    
              // Obter datas únicas e ordenar cronologicamente (igual ao SQL)
          const dates = [...new Set(evs.map(ev => new Date(ev.created_at).toDateString()))].sort((a, b) => new Date(a) - new Date(b));
    
    
    
    if (dates.length === 0) return 0;
    if (dates.length === 1) return 1;
    
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    let prevDate = null;
    
    // Usar a mesma lógica do SQL
    for (const dateStr of dates) {
      const currDate = new Date(dateStr);
      
      if (prevDate === null) {
        currentConsecutive = 1;
      } else {
        // Calcular diferença em dias usando UTC (igual ao SQL)
        const prevUTC = Date.UTC(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
        const currUTC = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
        const diffDays = (currUTC - prevUTC) / (1000 * 60 * 60 * 24);
        
        
        
        if (diffDays === 1) {
          // Dias consecutivos
          currentConsecutive++;
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
          
        } else {
          // Quebra na sequência
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
          currentConsecutive = 1;
          
        }
      }
      
      prevDate = currDate;
    }
    
    // Garantir que o último grupo seja considerado (igual ao SQL)
    maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    
    
    return maxConsecutive;
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
             <Title>Conquistas</Title>

             {loading && (
         <LoadingText>CARREGANDO CONQUISTAS...</LoadingText>
       )}

             {error && (
         <ErrorText>Erro ao carregar conquistas</ErrorText>
       )}

      {!loading && !error && (
        <>
          <BadgesGrid>
            {badges.map(badge => (
              <BadgeCard key={badge.id} earned={badge.earned}>
                                 {badge.earned && <EarnedBadge>Conquistado</EarnedBadge>}
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

                     {/* <RecentBadges>
             <BadgeName style={{ marginBottom: '20px' }}>Selos Recentes</BadgeName>
            {userBadges.length === 0 ? (
                             <div style={{ textAlign: 'center', color: '#6a6a6a', padding: '20px' }}>
                 Nenhum selo conquistado ainda
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
          </RecentBadges> */}
        </>
      )}
    </Container>
  );
};

export default Badges; 