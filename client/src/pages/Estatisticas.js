import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';

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

const SectionTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  margin: 30px 0 20px 0;
  text-transform: uppercase;
`;

const ExportSection = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
`;

const ExportTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ExportButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 10px 15px;
  border: 2px solid #4a4a4a;
  background: ${props => props.variant === 'csv' ? '#4a8a4a' : '#4a6a8a'};
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.variant === 'csv' ? '#6aaa6a' : '#6a8aaa'};
    border-color: #6a6a6a;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExportInfo = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  line-height: 1.4;
`;

// Estilos para o gráfico de barras
const ChartSection = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
`;

const ChartTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
  text-align: center;
`;

const ChartContainer = styled.div`
  height: 300px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 4px;
  padding: 20px 0;
  border-bottom: 2px solid #4a4a4a;
  border-left: 2px solid #4a4a4a;
  position: relative;
`;

const Bar = styled.div`
  background: linear-gradient(180deg, #4CAF50 0%, #45a049 100%);
  border: 1px solid #2a2a2a;
  border-radius: 4px 4px 0 0;
  min-width: 20px;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(180deg, #6aaa6a 0%, #4CAF50 100%);
    transform: scaleY(1.05);
  }
`;

const BarLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #6a6a6a;
  text-align: center;
  margin-top: 8px;
  transform: rotate(-45deg);
  white-space: nowrap;
`;

const BarValue = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #ffffff;
  text-align: center;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 2px 4px;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${Bar}:hover & {
    opacity: 1;
  }
`;

const NoDataText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;
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
    consecutive_days: 0
  });
  const [communityStats, setCommunityStats] = useState({
    total_evs: 0,
    average_score: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [evData, setEvData] = useState([]);
  const [dailyChartData, setDailyChartData] = useState([]);

  const loadStats = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Primeiro, obter o total real de EVs do usuário usando count
      const { count: totalEVsCount, error: countError } = await supabase
        .from('evs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      // Carregar todos os scores do usuário para cálculos (usando paginação se necessário)
      let allScores = [];
      const pageSize = 1000;
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: scoresPage, error: scoresError } = await supabase
          .from('evs')
          .select('score')
          .eq('user_id', user.id)
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);

        if (scoresError) throw scoresError;

        if (scoresPage && scoresPage.length > 0) {
          allScores = allScores.concat(scoresPage);
          from += pageSize;
          hasMore = scoresPage.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      // Carregar EVs recentes para exibição e gráficos (últimos 1000)
      const { data: userEVs, error: evsError } = await supabase
        .from('evs')
        .select('score, created_at, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000); // Apenas para exibição e gráficos

      if (evsError) throw evsError;
      
      setEvData(userEVs || []);

      // Calcular estatísticas usando o count real para total_evs
      const total_evs = totalEVsCount || 0;
      
      // Calcular total_points e average_score usando todos os scores
      const total_points = allScores.reduce((sum, ev) => sum + ev.score, 0);
      const average_score = total_evs > 0 ? (total_points / total_evs).toFixed(1) : 0;
      const max_score = allScores.length > 0 ? Math.max(...allScores.map(ev => ev.score)) : 0;
      
      // Calcular dias consecutivos
      const consecutiveDays = calculateConsecutiveDays(userEVs);

      // Preparar dados do gráfico de barras (EVs por dia)
      const dailyData = prepareDailyChartData(userEVs);
      setDailyChartData(dailyData);

      setUserStats({
        total_evs,
        total_points,
        average_score,
        max_score,
        consecutive_days: consecutiveDays
      });

      // Carregar total de EVs da comunidade (mesmo método da janelinha)
      const { count: communityTotalEVs, error: communityError } = await supabase
        .from('evs')
        .select('*', { count: 'exact' });

      if (communityError) throw communityError;

      // Carregar todas as EVs para calcular média da comunidade
      const { data: allEVs, error: allEVsError } = await supabase
        .from('evs')
        .select('score');

      if (allEVsError) throw allEVsError;

      const community_average_score = allEVs?.length > 0 
        ? (allEVs.reduce((sum, ev) => sum + ev.score, 0) / allEVs.length).toFixed(1) 
        : 0;

      setCommunityStats({
        total_evs: communityTotalEVs || 0,
        average_score: community_average_score
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError('Erro ao carregar estatísticas');
    }
    
    setLoading(false);
  };

  const prepareDailyChartData = (evs) => {
    if (!evs || evs.length === 0) return [];

    // Agrupar EVs por dia
    const dailyCounts = evs.reduce((acc, ev) => {
      const date = new Date(ev.created_at).toLocaleDateString('pt-BR');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Converter para array e ordenar por data
    const sortedDates = Object.keys(dailyCounts).sort((a, b) => {
      return new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'));
    });

    // Pegar os últimos 14 dias ou todos se menos que 14
    const recentDates = sortedDates.slice(-14);

    return recentDates.map(date => ({
      date,
      count: dailyCounts[date]
    }));
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
      const filename = `EV_${user.email}_${new Date().toISOString().split('T')[0]}.csv`;
      
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
      content += `Usuário: ${user.email}\n`;
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

      const filename = `EV_${user.email}_${new Date().toISOString().split('T')[0]}.txt`;
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

  useEffect(() => {
    loadStats();
  }, [user]);

  // Calcular altura máxima para o gráfico
  const maxCount = dailyChartData.length > 0 ? Math.max(...dailyChartData.map(d => d.count)) : 0;

  return (
    <Container>
      <Title>Estatísticas</Title>
      
      <SectionTitle>Minhas Estatísticas</SectionTitle>
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
      </StatsGrid>

      {/* Gráfico de barras de EVs por dia */}
      {dailyChartData.length > 0 && (
        <ChartSection>
          <ChartTitle>EVs por Dia (Últimos 14 dias)</ChartTitle>
          <ChartContainer>
            {dailyChartData.map((day, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <Bar 
                  style={{ 
                    height: `${maxCount > 0 ? (day.count / maxCount) * 200 : 0}px`,
                    maxHeight: '200px'
                  }}
                >
                  <BarValue>{day.count}</BarValue>
                </Bar>
                <BarLabel>{day.date}</BarLabel>
              </div>
            ))}
          </ChartContainer>
        </ChartSection>
      )}

      <SectionTitle>Estatísticas da Comunidade</SectionTitle>
      <StatsGrid>
        <StatCard>
          <StatValue>{communityStats.total_evs.toLocaleString()}</StatValue>
          <StatLabel>Total de EVs</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{communityStats.average_score}</StatValue>
          <StatLabel>Média Geral</StatLabel>
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
        </>
      )}
    </Container>
  );
};

export default Estatisticas; 