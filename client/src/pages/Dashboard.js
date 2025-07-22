import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import SoundEffect from '../components/SoundEffect';
import BadgeNotification from '../components/BadgeNotification';
import DailyProgressBar from '../components/DailyProgressBar';
import EVReminder from '../components/EVReminder';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ theme }) => theme.background};
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: ${({ theme }) => theme.text};
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
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  text-transform: uppercase;
`;

const TextArea = styled.textarea`
  font-family: 'Press Start 2P', monospace;
  padding: 12px;
  border: 2px solid #4a4a4a;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 14px;
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #6a6a6a;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  }
`;

const ScoreButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

const ScoreButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  padding: 15px 10px;
  border: 2px solid #4a4a4a;
  background: ${props => props.selected ? '#4a6a8a' : '#1a1a1a'};
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.selected ? '#6a8aaa' : '#4a4a4a'};
    border-color: #6a6a6a;
  }
`;

const SubmitButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 15px;
  border: 2px solid #4a4a4a;
  background: #2a6a2a;
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 10px;
  
  &:hover {
    background: #4a8a4a;
    border-color: #6aaa6a;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #4a4a4a;
    border-color: #6a6a6a;
    cursor: not-allowed;
    transform: none;
  }
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

const RecentEVs = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  backdrop-filter: blur(10px);
`;

const EVItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #4a4a4a;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EVInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const EVScore = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  font-weight: bold;
`;

const EVDate = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
`;

const EVNotes = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    score: null,
    notes: ''
  });
  const [stats, setStats] = useState({
    total_evs: 0,
    average_score: 0,
    max_score: 0,
    today_evs: 0,
    today_points: 0,
    week_evs: 0
  });
  const [recentEVs, setRecentEVs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playCoinSound, setPlayCoinSound] = useState(false);
  const [playVictorySound, setPlayVictorySound] = useState(false);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);

  useEffect(() => {
    if (user) {
      loadStats();
      loadRecentEVs();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // Buscar todos os EVs do usuário
      const { data: allEVs, error } = await supabase
        .from('evs')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (allEVs && allEVs.length > 0) {
        const total_evs = allEVs.length;
        const scores = allEVs.map(ev => ev.score);
        const average_score = (scores.reduce((a, b) => a + b, 0) / total_evs).toFixed(1);
        const max_score = Math.max(...scores);

        // EVs de hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const today_evs = allEVs.filter(ev => {
          const evDate = new Date(ev.created_at);
          return evDate >= today;
        });
        const today_points = today_evs.reduce((sum, ev) => sum + ev.score, 0);

        // EVs da semana
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const week_evs = allEVs.filter(ev => {
          const evDate = new Date(ev.created_at);
          return evDate >= weekAgo;
        });

        setStats({
          total_evs,
          average_score,
          max_score,
          today_evs: today_evs.length,
          today_points,
          week_evs: week_evs.length
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadRecentEVs = async () => {
    try {
      const { data, error } = await supabase
        .from('evs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEVs(data || []);
    } catch (error) {
      console.error('Erro ao carregar EVs recentes:', error);
    }
  };

  const handleScoreSelect = (score) => {
    setFormData({
      ...formData,
      score
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.score === null) {
      toast.error('Selecione uma pontuação!');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('evs')
        .insert([
          {
            user_id: user.id,
            score: formData.score,
            notes: formData.notes,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      // Verificar se é o primeiro EV e atribuir badge de Iniciante Consciencial
      const { data: evCount } = await supabase
        .from('evs')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);
      
      // Verificar se é o primeiro EV e atribuir badge de Iniciante Consciencial
      if (evCount && evCount.length === 1) {
        const { data: badge } = await supabase
          .from('badges')
          .select('id')
          .eq('name', 'Iniciante Consciencial')
          .single();
        
        if (badge) {
          await supabase
            .from('user_badges')
            .insert([
              {
                user_id: user.id,
                badge_id: badge.id,
                awarded_at: new Date().toISOString()
              }
            ]);
          
          // Mostrar pop-up de badge conquistado
          setEarnedBadge({
            name: 'Iniciante Consciencial',
            description: 'Primeiro EV registrado',
            icon: '🌱'
          });
          setShowBadgeNotification(true);
          
          // Tocar som de vitória
          setPlayVictorySound(true);
          
          toast.success('EV registrado com sucesso! 🎉 Badge "Iniciante Consciencial" conquistado!');
        } else {
          toast.success('EV registrado com sucesso!');
        }
      } else {
        toast.success('EV registrado com sucesso!');
      }
      
      // Verificar se atingiu 20 EVs no dia e atribuir badge de Mestre Diário
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayEVs } = await supabase
        .from('evs')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());
      
      if (todayEVs && todayEVs.length >= 20 && todayEVs.length % 10 === 0) {
        setPlayVictorySound(true);
        toast.success(`Parabéns! Você atingiu ${todayEVs.length} EVs hoje! 🎉`);
      }

      if (todayEVs && todayEVs.length === 20) {
        // Verificar se já tem o badge de Mestre Diário
        const { data: existingBadge } = await supabase
          .from('user_badges')
          .select('badges!inner(*)')
          .eq('user_id', user.id)
          .eq('badges.name', 'Mestre Diário')
          .single();
        
        if (!existingBadge) {
          const { data: badge } = await supabase
            .from('badges')
            .select('id')
            .eq('name', 'Mestre Diário')
            .single();
          
          if (badge) {
            await supabase
              .from('user_badges')
              .insert([
                {
                  user_id: user.id,
                  badge_id: badge.id,
                  awarded_at: new Date().toISOString()
                }
              ]);
            
            // Mostrar pop-up de badge conquistado
            setEarnedBadge({
              name: 'Mestre Diário',
              description: 'Registrou 20 EVs em um único dia',
              icon: '⚡'
            });
            setShowBadgeNotification(true);
            
            // Tocar som de vitória
            setPlayVictorySound(true);
            
            toast.success('🎉 Badge "Mestre Diário" conquistado! 20 EVs em um dia!');
          }
        }
      }
      
      // Verificar se registrou EV no período de fundação (1/7/2025 a 31/7/2025)
      const foundationStart = new Date('2025-07-01T00:00:00');
      const foundationEnd = new Date('2025-07-31T23:59:59');
      const evDate = new Date();
      
      if (evDate >= foundationStart && evDate <= foundationEnd) {
        // Verificar se já tem o badge de Líder 4 Anos
        const { data: existingFoundationBadge } = await supabase
          .from('user_badges')
          .select('badges!inner(*)')
          .eq('user_id', user.id)
          .eq('badges.name', 'Líder 4 Anos de Fundação')
          .single();
        
        if (!existingFoundationBadge) {
          const { data: foundationBadge } = await supabase
            .from('badges')
            .select('id')
            .eq('name', 'Líder 4 Anos de Fundação')
            .single();
          
          if (foundationBadge) {
            await supabase
              .from('user_badges')
              .insert([
                {
                  user_id: user.id,
                  badge_id: foundationBadge.id,
                  awarded_at: new Date().toISOString()
                }
              ]);
            
            // Mostrar pop-up de badge conquistado
            setEarnedBadge({
              name: 'Líder 4 Anos de Fundação',
              description: 'Registrou EVs durante o período de fundação de 4 anos',
              icon: '🏆'
            });
            setShowBadgeNotification(true);
            
            // Tocar som de vitória
            setPlayVictorySound(true);
            
            toast.success('🏆 Badge "Líder 4 Anos de Fundação" conquistado!');
          }
        }
      }
      
      // Tocar som de moeda como recompensa
      setPlayCoinSound(true);
      
      setFormData({
        score: null,
        notes: ''
      });
      
      loadStats();
      loadRecentEVs();
      
      // Resetar o som após tocar
      setTimeout(() => setPlayCoinSound(false), 100);

      // Verificar novos badges
      await checkAndAwardBadges();

    } catch (error) {
      console.error('Erro ao registrar EV:', error);
      toast.error('Erro ao registrar EV');
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const checkAndAwardBadges = async () => {
    try {
      // Buscar todos os EVs do usuário
      const { data: userEVs } = await supabase
        .from('evs')
        .select('score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!userEVs) return;

      const totalEVs = userEVs.length;
      
      // Buscar badges já conquistados
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];

      // Função para atribuir badge
      const awardBadge = async (badgeName, description, icon) => {
        const { data: badge } = await supabase
          .from('badges')
          .select('id')
          .eq('name', badgeName)
          .single();

        if (badge && !earnedBadgeIds.includes(badge.id)) {
          await supabase
            .from('user_badges')
            .insert([{
              user_id: user.id,
              badge_id: badge.id,
              awarded_at: new Date().toISOString()
            }]);

          setEarnedBadge({ name: badgeName, description, icon });
          setShowBadgeNotification(true);
          setPlayVictorySound(true);
          toast.success(`🎉 Badge "${badgeName}" conquistado!`);
          return true;
        }
        return false;
      };

      // 1. Verificar badges de total de EVs
      if (totalEVs >= 500) {
        await awardBadge('Mestre Consciencial', 'Primeiros 500 EVs registrados', '🧙‍♂️');
      }
      if (totalEVs >= 1000) {
        await awardBadge('Sábio Consciencial', 'Primeiros 1000 EVs registrados', '🧙‍♀️');
      }

      // 2. Verificar badges de EVs em um único dia
      const dailyEVCounts = {};
      userEVs.forEach(ev => {
        const date = new Date(ev.created_at).toDateString();
        dailyEVCounts[date] = (dailyEVCounts[date] || 0) + 1;
      });

      const maxDailyEVs = Math.max(...Object.values(dailyEVCounts));
      
      if (maxDailyEVs >= 30) {
        await awardBadge('Maratonista EV', '30 EVs registrados em um único dia', '🏃');
      }
      if (maxDailyEVs >= 40) {
        await awardBadge('Ultra Maratonista EV', '40 EVs registrados em um único dia', '🏃‍♂️');
      }
      if (maxDailyEVs >= 50) {
        await awardBadge('Mega Maratonista EV', '50 EVs registrados em um único dia', '🏃‍♀️');
      }

      // 3. Verificar badges de dias consecutivos
      const consecutiveDays = calculateConsecutiveDays(userEVs);
      
      if (consecutiveDays >= 90) {
        await awardBadge('Mestre da Persistência', '90 dias consecutivos de EVs', '🎯');
      }
      if (consecutiveDays >= 180) {
        await awardBadge('Semi-Anual Consciencial', '180 dias consecutivos de EVs', '📅');
      }
      if (consecutiveDays >= 360) {
        await awardBadge('Anual Consciencial', '360 dias consecutivos de EVs', '🗓️');
      }

    } catch (error) {
      console.error('Erro ao verificar badges:', error);
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

  return (
    <Container>
      <EVReminder />
      <Title>Dashboard</Title>
      
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
          <StatValue>{stats.today_evs}</StatValue>
          <StatLabel>EVs Hoje</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.today_points}</StatValue>
          <StatLabel>Pontos Hoje</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.week_evs}</StatValue>
          <StatLabel>EVs na Semana</StatLabel>
        </StatCard>
      </StatsGrid>
      
      {/* Barra de Progresso Diária */}
      <DailyProgressBar currentEVs={stats.today_evs} targetEVs={20} />

      <Grid>
        <Card>
          <CardTitle>Registrar Novo EV</CardTitle>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Pontuação (0-4)</Label>
              <ScoreButtons>
                {[0, 1, 2, 3, 4].map(score => (
                  <ScoreButton
                    key={score}
                    type="button"
                    selected={formData.score === score}
                    onClick={() => handleScoreSelect(score)}
                  >
                    {score}
                  </ScoreButton>
                ))}
              </ScoreButtons>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <TextArea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Descreva sua experiência..."
                maxLength={500}
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar EV'}
            </SubmitButton>
          </Form>
        </Card>

        <RecentEVs>
          <CardTitle>EVs Recentes</CardTitle>
          {recentEVs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6a6a6a', padding: '20px' }}>
              Nenhum EV registrado ainda
            </div>
          ) : (
            recentEVs.map(ev => (
              <EVItem key={ev.id}>
                <EVInfo>
                  <EVScore>EV {ev.score}</EVScore>
                  <EVDate>{formatDate(ev.created_at)}</EVDate>
                  {ev.notes && <EVNotes>{ev.notes}</EVNotes>}
                </EVInfo>
              </EVItem>
            ))
          )}
        </RecentEVs>
      </Grid>
      
      {/* Som de moeda quando registrar EV */}
      <SoundEffect 
        soundFile="/sounds/coin.mp3" 
        play={playCoinSound} 
        volume={0.3}
      />
      
      {/* Som de vitória quando conquistar badge */}
      <SoundEffect 
        soundFile="/sounds/victory.mp3" 
        play={playVictorySound} 
        volume={0.4}
      />
      
      {/* Pop-up de badge conquistado */}
      <BadgeNotification
        badge={earnedBadge}
        show={showBadgeNotification}
        onClose={() => {
          setShowBadgeNotification(false);
          setEarnedBadge(null);
          setPlayVictorySound(false);
        }}
      />
    </Container>
  );
};

export default Dashboard; 