import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';
import { useEVTimer } from '../contexts/EVTimerContext';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import SoundEffect from '../components/SoundEffect';
import BadgeNotification from '../components/BadgeNotification';
import DailyProgressBar from '../components/DailyProgressBar';
import EVReminder from '../components/EVReminder';
import BluetoothEVController from '../components/experimental/BluetoothEVController';

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
  
  /* Ensure minimum touch target height */
  min-height: 48px;
  
  /* Responsive adjustments */
  @media (max-width: 400px) {
    padding: 10px;
    font-size: 13px;
    min-height: 60px;
  }
`;

const ScoreButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 10px;
  
  /* Responsive: Stack vertically on very small screens */
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
  
  /* Alternative: 3 columns on medium small screens */
  @media (max-width: 480px) and (min-width: 401px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ScoreButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  padding: 15px 10px;
  border: 2px solid #4a4a4a;
  background: ${props => props.selected ? '#4a6a8a' : '#1a1a1a'};
  color: #ffffff;
  cursor: pointer;
  transition: all 0.1s ease; /* Faster transition for better tactile feedback */
  
  &:hover {
    background: ${props => props.selected ? '#6a8aaa' : '#4a4a4a'};
    border-color: #6a6a6a;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    background: ${props => props.selected ? '#3a5a7a' : '#0a0a0a'};
  }
  
  /* Ensure minimum touch target size */
  min-height: 48px;
  min-width: 48px;
  
  /* Responsive padding adjustment */
  @media (max-width: 400px) {
    padding: 12px 8px;
    font-size: 16px;
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
  transition: all 0.1s ease;
  margin-top: 10px;
  
  &:hover {
    background: #4a8a4a;
    border-color: #6aaa6a;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    background: #1a5a1a;
  }
  
  &:disabled {
    background: #4a4a4a;
    border-color: #6a6a6a;
    cursor: not-allowed;
    transform: none;
    opacity: 0.7;
  }
  
  /* Ensure minimum touch target size */
  min-height: 48px;
  min-width: 48px;
  
  /* Responsive adjustments */
  @media (max-width: 400px) {
    padding: 12px;
    font-size: 12px;
  }
`;

const EscalaSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const EscalaTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
  text-align: center;
`;

const EscalaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
`;

const EscalaCard = styled.div`
  background: rgba(74, 106, 138, 0.1);
  border: 1px solid #4a6a8a;
  border-radius: 6px;
  padding: 12px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    background: rgba(74, 106, 138, 0.2);
  }
`;

const EscalaNota = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const NotaBadge = styled.span`
  background: #4a6a8a;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  font-weight: bold;
  margin-right: 10px;
  min-width: 30px;
  text-align: center;
`;

const EscalaDescricao = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  color: #ffffff;
  line-height: 1.3;
  margin: 0;
`;

const escalaAutoqualificacao = [
  {
    nota: 0,
    descricao: "Tentei instalar o EV mas não senti nada."
  },
  {
    nota: 1,
    descricao: "Percebi a energia circular com dificuldade."
  },
  {
    nota: 2,
    descricao: "Percebi a energia circular com facilidade."
  },
  {
    nota: 3,
    descricao: "Percebi o EV."
  },
  {
    nota: 4,
    descricao: "Percebi o EV intensamente."
  }
];

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
  const { isOnline, saveEVOffline } = useSync();
  const { soundEnabled } = useEVTimer();
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
      checkRecentBadges();
    }
  }, [user]);

  // Verificar badges recém-conquistados ao carregar a página
  const checkRecentBadges = async () => {
    try {
      // Verificar especificamente o badge Virada Conscienciológica 2026
      const { data: virada2026Badge } = await supabase
        .from('user_badges')
        .select(`
          awarded_at,
          badges!inner(name, description, icon)
        `)
        .eq('user_id', user.id)
        .eq('badges.name', 'Virada Conscienciológica 2026')
        .single();

      if (virada2026Badge) {
        const lastShownKey = 'badge_shown_virada_2026';
        const lastShown = localStorage.getItem(lastShownKey);
        
        if (!lastShown) {
          setEarnedBadge({
            name: virada2026Badge.badges.name,
            description: virada2026Badge.badges.description,
            icon: virada2026Badge.badges.icon
          });
          setShowBadgeNotification(true);
          setPlayVictorySound(true);
          localStorage.setItem(lastShownKey, 'true');
          return;
        }
      }

      // Verificar especificamente o badge de Janeiro 2026 (mesmo se foi conquistado há mais tempo)
      const { data: janeiro2026Badge } = await supabase
        .from('user_badges')
        .select(`
          awarded_at,
          badges!inner(name, description, icon)
        `)
        .eq('user_id', user.id)
        .eq('badges.name', 'Janeiro 2026')
        .single();

      if (janeiro2026Badge) {
        const lastShownKey = 'badge_shown_janeiro_2026';
        const lastShown = localStorage.getItem(lastShownKey);
        
        if (!lastShown) {
          setEarnedBadge({
            name: janeiro2026Badge.badges.name,
            description: janeiro2026Badge.badges.description,
            icon: janeiro2026Badge.badges.icon
          });
          setShowBadgeNotification(true);
          setPlayVictorySound(true);
          // Marcar como mostrado
          localStorage.setItem(lastShownKey, 'true');
          return;
        }
      }

      // Buscar outros badges conquistados nas últimas 24 horas
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      
      const { data: recentBadges } = await supabase
        .from('user_badges')
        .select(`
          awarded_at,
          badges!inner(name, description, icon)
        `)
        .eq('user_id', user.id)
        .gte('awarded_at', oneDayAgo.toISOString())
        .neq('badges.name', 'Janeiro 2026') // Excluir janeiro 2026 pois já verificamos acima
        .neq('badges.name', 'Virada Conscienciológica 2026') // Excluir virada 2026 pois já verificamos acima
        .order('awarded_at', { ascending: false })
        .limit(1);

      if (recentBadges && recentBadges.length > 0) {
        const mostRecentBadge = recentBadges[0];
        // Verificar se já mostramos esta comemoração hoje usando localStorage
        const lastShownKey = `badge_shown_${mostRecentBadge.badges.name}_${new Date(mostRecentBadge.awarded_at).toDateString()}`;
        const lastShown = localStorage.getItem(lastShownKey);
        
        if (!lastShown) {
          setEarnedBadge({
            name: mostRecentBadge.badges.name,
            description: mostRecentBadge.badges.description,
            icon: mostRecentBadge.badges.icon
          });
          setShowBadgeNotification(true);
          setPlayVictorySound(true);
          // Marcar como mostrado
          localStorage.setItem(lastShownKey, 'true');
        }
      }
    } catch (error) {
      console.log('Erro ao verificar badges recentes (não crítico):', error);
    }
  };

  // Reset do som de vitória após tocar
  useEffect(() => {
    if (playVictorySound) {
      const timer = setTimeout(() => {
        setPlayVictorySound(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [playVictorySound]);

  const loadStats = async () => {
    try {
      // Obter o total real de EVs usando count
      const { count: totalEVsCount, error: countError } = await supabase
        .from('evs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      // Carregar todos os EVs do usuário para cálculos (usando paginação se necessário)
      let allEVs = [];
      const pageSize = 1000;
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: evsPage, error: pageError } = await supabase
          .from('evs')
          .select('score, created_at')
          .eq('user_id', user.id)
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);

        if (pageError) throw pageError;

        if (evsPage && evsPage.length > 0) {
          allEVs = allEVs.concat(evsPage);
          from += pageSize;
          hasMore = evsPage.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      if (allEVs && allEVs.length > 0) {
        const total_evs = totalEVsCount || allEVs.length;
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
      // Tocar som de moeda sempre que registrar EV
      setPlayCoinSound(true);
      
      if (!isOnline) {
        // Modo offline - salvar no localStorage
        const result = await saveEVOffline(formData.score, formData.notes);
        
        if (result.success) {
          // Reset form
          setFormData({
            score: null,
            notes: ''
          });
          
          // Recarregar dados locais
          await loadStats();
          await loadRecentEVs();
        }
      } else {
        // Modo online - salvar no Supabase
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
        if (evCount === 1) {
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

        // Verificar se o EV foi registrado durante a Virada Conscienciológica 2026 (22 a 24 de agosto, horário de Brasília)
        const viradaStart = new Date('2026-08-22T00:00:00-03:00');
        const viradaEnd = new Date('2026-08-24T23:59:59-03:00');
        const evCreatedAt = new Date();
        if (evCreatedAt >= viradaStart && evCreatedAt <= viradaEnd) {
          // Buscar o badge
          const { data: viradaBadge } = await supabase
            .from('badges')
            .select('id, name, description, icon')
            .eq('name', 'Virada Conscienciológica 2026')
            .single();

          if (viradaBadge) {
            // Verificar se o usuário já tem o badge
            const { data: existing } = await supabase
              .from('user_badges')
              .select('id')
              .eq('user_id', user.id)
              .eq('badge_id', viradaBadge.id)
              .single();

            if (!existing) {
              await supabase
                .from('user_badges')
                .insert([
                  {
                    user_id: user.id,
                    badge_id: viradaBadge.id,
                    awarded_at: new Date().toISOString()
                  }
                ]);

              setEarnedBadge({
                name: viradaBadge.name,
                description: viradaBadge.description,
                icon: viradaBadge.icon
              });
              setShowBadgeNotification(true);
              setPlayVictorySound(true);
            }
          }
        }
        
        // Verificar se atingiu marcos especiais de EVs no dia para tocar som de vitória
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: todayEVs } = await supabase
          .from('evs')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString());
        
        if (todayEVs && todayEVs.length > 0) {
          // Tocar som de vitória apenas quando ACABAR de atingir marcos especiais (20, 30, 40, 50 EVs)
          const specialMilestones = [20, 30, 40, 50];
          const currentEVs = todayEVs.length;
          
          // Verificar se acabou de atingir um marco (antes tinha menos, agora tem exatamente o marco)
          if (specialMilestones.includes(currentEVs)) {
            console.log(`🎉 Marco atingido: ${currentEVs} EVs hoje!`);
            setPlayVictorySound(true);
            toast.success(`🎉 Parabéns! Você atingiu ${currentEVs} EVs hoje!`);
          }
        }

        // Verificação de badges movida para função separada para evitar erros
        try {
          await checkAndAwardBadges();
        } catch (error) {
          console.log('Erro ao verificar badges (não crítico):', error);
        }
        
        // Verificação de badges de fundação movida para função separada
        try {
          await checkFoundationBadges();
        } catch (error) {
          console.log('Erro ao verificar badges de fundação (não crítico):', error);
        }
        
        // Reset form
        setFormData({
          score: null,
          notes: ''
        });
        
        // Recarregar dados
        await loadStats();
        await loadRecentEVs();
      }
      
    } catch (error) {
      console.error('Erro ao registrar EV:', error);
      toast.error('Erro ao registrar EV. Tente novamente.');
    } finally {
      setLoading(false);
    }
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

      // 2. Verificar badges de EVs diários
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEVs = userEVs.filter(ev => new Date(ev.created_at) >= today);
      
      if (todayEVs.length >= 30) {
        await awardBadge('Maratonista EV', '30 EVs em um dia', '🏃‍♂️');
      }
      if (todayEVs.length >= 40) {
        await awardBadge('Ultra Maratonista EV', '40 EVs em um dia', '🏃‍♀️');
      }
      if (todayEVs.length >= 50) {
        await awardBadge('Mega Maratonista EV', '50 EVs em um dia', '🚀');
      }

      // 3. Verificar badges de dias consecutivos
      const consecutiveDays = calculateConsecutiveDays(userEVs);
      
      if (consecutiveDays >= 90) {
        await awardBadge('Mestre da Persistência', '90 dias consecutivos de EVs', '💪');
      }
      if (consecutiveDays >= 180) {
        await awardBadge('Semi-Anual Consciencial', '180 dias consecutivos de EVs', '📅');
      }
      if (consecutiveDays >= 360) {
        await awardBadge('Anual Consciencial', '360 dias consecutivos de EVs', '🗓️');
      }

      // 4. Verificar badge de Janeiro 2026
      const january2026Start = new Date('2026-01-01T00:00:00Z');
      const january2026End = new Date('2026-02-01T00:00:00Z');
      const january2026EVs = userEVs.filter(ev => {
        const evDate = new Date(ev.created_at);
        return evDate >= january2026Start && evDate < january2026End;
      });
      
      if (january2026EVs.length >= 1) {
        await awardBadge('Janeiro 2026', 'Pelo menos 1 EV registrado em janeiro de 2026', '🎊');
      }

    } catch (error) {
      console.error('Erro ao verificar badges:', error);
    }
  };

  const checkFoundationBadges = async () => {
    try {
      // Buscar dados do perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const userCreatedAt = new Date(profile.created_at);
      const foundationEndDate = new Date('2025-07-31T23:59:59Z');

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

      // Verificar badge de Fundador (cadastro até 31/7/2025)
      if (userCreatedAt <= foundationEndDate) {
        try {
          await awardBadge('Fundador', 'Usuário fundador do #20EVSADAY', '🏗️');
        } catch (error) {
          console.error('Erro ao verificar badge Fundador:', error);
        }
      }

      // Verificar badge de Líder 4 Anos de Fundação (EVs de 1/7/2025 a 31/7/2025)
      const foundationStartDate = new Date('2025-07-01T00:00:00Z');
      
      const { data: foundationEVs } = await supabase
        .from('evs')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', foundationStartDate.toISOString())
        .lte('created_at', foundationEndDate.toISOString());

      if (foundationEVs && foundationEVs.length > 0) {
        try {
          await awardBadge('Líder 4 Anos de Fundação', 'EVs registrados durante período de fundação', '👑');
        } catch (error) {
          console.error('Erro ao verificar badge Líder 4 Anos de Fundação:', error);
        }
      }

    } catch (error) {
      console.error('Erro ao verificar badges de fundação:', error);
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
      <Title>Registro</Title>
      
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
          
          <EscalaSection>
            <EscalaTitle>Escala de Autoqualificação do EV</EscalaTitle>
            <EscalaGrid>
              {escalaAutoqualificacao.map((item, index) => (
                <EscalaCard key={index}>
                  <EscalaNota>
                    <NotaBadge>Nota {item.nota}</NotaBadge>
                    <EscalaDescricao>{item.descricao}</EscalaDescricao>
                  </EscalaNota>
                </EscalaCard>
              ))}
            </EscalaGrid>
          </EscalaSection>
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
        play={playCoinSound && soundEnabled} 
        volume={0.3}
      />
      
      {/* Som de vitória quando conquistar badge ou atingir marcos */}
      <SoundEffect 
        soundFile="/sounds/victory.mp3" 
        play={playVictorySound && soundEnabled} 
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

      {/* Funcionalidade Experimental - Bluetooth EV Controller */}
      <BluetoothEVController />
    </Container>
  );
};

export default Dashboard; 