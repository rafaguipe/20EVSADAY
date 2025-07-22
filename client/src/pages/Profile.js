import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { useEVTimer } from '../contexts/EVTimerContext';

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

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ToggleLabel = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  font-weight: bold;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  cursor: pointer;
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #8a4a4a;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
  
  ${({ checked }) => checked && `
    background-color: #4a8a4a;
    
    &:before {
      transform: translateX(26px);
    }
  `}
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleStatus = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: ${({ enabled }) => enabled ? '#4a8a4a' : '#8a4a4a'};
  margin-left: 8px;
`;

const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const ExportSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(74, 106, 138, 0.1);
  border: 2px solid #4a6a8a;
  border-radius: 8px;
`;

const ExportTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #4a6a8a;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const ExportButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  padding: 12px 20px;
  border: 2px solid ${({ variant }) => {
    if (variant === 'txt') return '#ffc107';
    if (variant === 'csv') return '#28a745';
    return '#4a6a8a';
  }};
  background: ${({ variant }) => {
    if (variant === 'txt') return 'rgba(255, 193, 7, 0.1)';
    if (variant === 'csv') return 'rgba(40, 167, 69, 0.1)';
    return 'rgba(74, 106, 138, 0.1)';
  }};
  color: ${({ variant }) => {
    if (variant === 'txt') return '#ffc107';
    if (variant === 'csv') return '#28a745';
    return '#4a6a8a';
  }};
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${({ variant }) => {
      if (variant === 'txt') return '#ffc107';
      if (variant === 'csv') return '#28a745';
      return '#4a6a8a';
    }};
    color: white;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ExportInfo = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  margin-top: 15px;
  line-height: 1.4;
`;

const Profile = () => {
  const { user, updateAvatar } = useAuth();
  const { themeName, toggleTheme } = useTheme();
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
  const [evInterval, setEvInterval] = useState(25);
  const { intervalMinutes, setIntervalMinutes, updateInterval, soundEnabled, updateSoundEnabled } = useEVTimer();
  const [soundEnabledLocal, setSoundEnabledLocal] = useState(true);
  const [evData, setEvData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.ev_interval_minutes) {
      setEvInterval(profile.ev_interval_minutes);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.sound_enabled !== undefined) {
      setSoundEnabledLocal(profile.sound_enabled);
    }
  }, [profile]);

  // Carregar dados de EV para exportação
  useEffect(() => {
    const loadEVData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('evs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Erro ao carregar dados EV:', error);
            return;
          }

          setEvData(data || []);
        } catch (err) {
          console.error('Erro inesperado ao carregar dados EV:', err);
        }
      }
    };

    loadEVData();
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

  const handleEvIntervalChange = async (e) => {
    const value = Math.max(1, Math.min(120, Number(e.target.value))); // mínimo 1 minuto
    setEvInterval(value);
    updateInterval(value); // atualiza o timer em tempo real
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ ev_interval_minutes: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    setLoading(false);
    if (!error) toast.success('Intervalo salvo!');
  };

  const handleSoundToggle = async () => {
    console.log('=== DEBUG TOGGLE ===');
    console.log('Estado atual:', soundEnabledLocal);
    console.log('User ID:', user?.id);
    
    const newValue = !soundEnabledLocal;
    console.log('Novo valor:', newValue);
    
    // Atualizar estado local imediatamente
    setSoundEnabledLocal(newValue);
    updateSoundEnabled(newValue);
    
    setLoading(true);
    
    try {
      console.log('Tentando atualizar no banco...');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          sound_enabled: newValue, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .select();
      
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('❌ ERRO:', error);
        // Reverter em caso de erro
        setSoundEnabledLocal(!newValue);
        updateSoundEnabled(!newValue);
        
        if (error.code === '42703') {
          toast.error('❌ Campo sound_enabled não existe. Execute o script SQL primeiro!');
        } else {
          toast.error(`❌ Erro: ${error.message}`);
        }
      } else {
        console.log('✅ Sucesso! Som atualizado para:', newValue);
        toast.success(newValue ? '🔊 Som ativado!' : '🔇 Som desativado!');
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      // Reverter em caso de erro
      setSoundEnabledLocal(!newValue);
      updateSoundEnabled(!newValue);
      toast.error('❌ Erro inesperado!');
    } finally {
      setLoading(false);
      console.log('=== FIM DEBUG TOGGLE ===');
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIntensityText = (score) => {
    const intensities = ['Nenhuma', 'Baixa', 'Média', 'Alta', 'Máxima'];
    return intensities[score] || 'N/A';
  };

  const exportToCSV = async () => {
    if (evData.length === 0) {
      toast.error('Nenhum EV registrado para exportar');
      return;
    }

    setExportLoading(true);
    try {
      // Criar cabeçalho CSV
      const headers = ['Data/Hora', 'Intensidade', 'Pontuação', 'Comentários'];
      const csvRows = [headers.join(',')];

      // Adicionar dados
      evData.forEach(ev => {
        const row = [
          `"${formatDate(ev.created_at)}"`,
          `"${getIntensityText(ev.score)}"`,
          ev.score,
          `"${(ev.notes || '').replace(/"/g, '""')}"` // Escapar aspas duplas
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const filename = `EV_${profile?.username || 'user'}_${new Date().toISOString().split('T')[0]}.csv`;
      
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      
      toast.success('📊 CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      toast.error('Erro ao gerar CSV');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToTXT = async () => {
    if (evData.length === 0) {
      toast.error('Nenhum EV registrado para exportar');
      return;
    }

    setExportLoading(true);
    try {
      let content = 'RELATÓRIO DE ESTADOS VIBRACIONAIS\n';
      content += '=====================================\n\n';
      content += `Usuário: ${profile?.username || user.email}\n`;
      content += `Período: ${formatDate(evData[evData.length - 1]?.created_at)} a ${formatDate(evData[0]?.created_at)}\n`;
      content += `Total de EVs: ${evData.length}\n\n`;
      
      // Estatísticas
      const avgScore = (evData.reduce((sum, ev) => sum + ev.score, 0) / evData.length).toFixed(2);
      const maxScore = Math.max(...evData.map(ev => ev.score));
      const minScore = Math.min(...evData.map(ev => ev.score));
      
      content += 'ESTATÍSTICAS:\n';
      content += `Média: ${avgScore}\n`;
      content += `Máxima: ${maxScore}\n`;
      content += `Mínima: ${minScore}\n\n`;
      
      content += 'REGISTROS:\n';
      content += '==========\n\n';
      
      evData.forEach((ev, index) => {
        content += `${index + 1}. ${formatDate(ev.created_at)}\n`;
        content += `   Intensidade: ${getIntensityText(ev.score)} (${ev.score}/4)\n`;
        if (ev.notes) {
          content += `   Comentário: ${ev.notes}\n`;
        }
        content += '\n';
      });

      const filename = `EV_${profile?.username || 'user'}_${new Date().toISOString().split('T')[0]}.txt`;
      downloadFile(content, filename, 'text/plain;charset=utf-8;');
      
      toast.success('📄 Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setExportLoading(false);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <Card>
          <CardTitle>Ajustes</CardTitle>
          <div style={{ marginBottom: 16 }}>
            <strong>Tema:</strong> {themeName === 'dark' ? 'Escuro' : 'Claro'}
            <button
              style={{
                marginLeft: 16,
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: themeName === 'dark' ? '#4a6a8a' : '#d1d1d1',
                color: themeName === 'dark' ? '#fff' : '#222',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={toggleTheme}
            >
              Alternar Tema
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Intervalo entre EVs:</strong>
            <input
              type="number"
              min={1} // mínimo 1 minuto
              max={120}
              value={evInterval}
              onChange={handleEvIntervalChange}
              style={{
                marginLeft: 16,
                width: 60,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #4a4a4a',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: 12,
                background: 'transparent',
                color: themeName === 'dark' ? '#fff' : '#222',
              }}
              disabled={loading}
            />
            <span style={{ marginLeft: 8, fontSize: 12 }}>min</span>
          </div>
          <ToggleContainer>
            <ToggleLabel>Notificações Sonoras:</ToggleLabel>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={soundEnabledLocal}
                onChange={handleSoundToggle}
                disabled={loading}
              />
              <ToggleSlider checked={soundEnabledLocal} />
            </ToggleSwitch>
            <ToggleStatus enabled={soundEnabledLocal}>
              {soundEnabledLocal ? 'LIGADO' : 'DESLIGADO'}
            </ToggleStatus>
          </ToggleContainer>
          <ExportSection>
            <ExportTitle>Exportar Dados</ExportTitle>
            <ExportButtons>
              <ExportButton 
                variant="txt" 
                onClick={exportToTXT} 
                disabled={exportLoading || evData.length === 0}
              >
                📄 Exportar Relatório
              </ExportButton>
              <ExportButton 
                variant="csv" 
                onClick={exportToCSV} 
                disabled={exportLoading || evData.length === 0}
              >
                📊 Exportar CSV
              </ExportButton>
            </ExportButtons>
            <ExportInfo>
              Exporte todos os seus registros de EV com data, hora, intensidade e comentários.
              {evData.length > 0 && ` Total de ${evData.length} registros disponíveis.`}
            </ExportInfo>
          </ExportSection>
        </Card>
      </Grid>
    </Container>
  );
};

export default Profile; 