import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const Container = styled.div`
  background: var(--app-bg); color: var(--app-text); font-family: var(--app-font); box-sizing: border-box; padding-bottom: 100px !important;
  padding: 20px;
  max-width: 1200px;
  margin:0 auto;
  
  /* Responsivo para tablets */
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  /* Responsivo para celulares */
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-family: var(--app-font);
  font-size: 24px;
  color: var(--app-text);
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
  
  /* Responsivo para tablets */
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 25px;
  }
  
  /* Responsivo para celulares */
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 20px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: var(--app-card);
  border: 2px solid var(--app-border);
  border-radius: calc(14px * var(--app-roundness, 1));
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const StatValue = styled.div`
  font-family: var(--app-font);
  font-size: 24px;
  color: var(--app-text);
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-family: var(--app-font);
  font-size: 13px;
  color: var(--app-muted);
  text-transform: uppercase;
`;

const ProgressSection = styled.div`
  background: var(--app-card);
  border: 2px solid var(--app-border);
  border-radius: calc(14px * var(--app-roundness, 1));
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
`;

const ProgressTitle = styled.h2`
  font-family: var(--app-font);
  font-size: 16px;
  color: var(--app-text);
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: var(--app-bg);
  border: 2px solid var(--app-border);
  border-radius: calc(10px * var(--app-roundness, 1));
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
    background: linear-gradient(90deg, transparent 0%, var(--app-field) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }
`;

const ProgressText = styled.div`
  font-family: var(--app-font);
  font-size: 12px;
  color: var(--app-muted);
  text-align: center;
`;

const LoadingText = styled.div`
  font-family: var(--app-font);
  font-size: 14px;
  color: var(--app-muted);
  text-align: center;
  padding: 40px;
`;

const ErrorText = styled.div`
  font-family: var(--app-font);
  font-size: 12px;
  color: #ff6b6b;
  text-align: center;
  padding: 40px;
`;

const SectionTitle = styled.h2`
  font-family: var(--app-font);
  font-size: 18px;
  color: var(--app-text);
  margin: 30px 0 20px 0;
  text-transform: uppercase;
`;

const ExportSection = styled.div`
  background: var(--app-card);
  border: 2px solid var(--app-border);
  border-radius: calc(14px * var(--app-roundness, 1));
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
`;

const ExportTitle = styled.h3`
  font-family: var(--app-font);
  font-size: 14px;
  color: var(--app-text);
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
  font-family: var(--app-font);
  font-size: 13px;
  padding: 10px 15px;
  border: 2px solid var(--app-border);
  background: ${props => props.variant === 'csv' ? '#4a8a4a' : 'var(--app-accent)'};
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.variant === 'csv' ? '#6aaa6a' : 'var(--app-accent)'};
    border-color: var(--app-muted);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExportInfo = styled.div`
  font-family: var(--app-font);
  font-size: 13px;
  color: var(--app-muted);
  line-height: 1.4;
`;

const NoDataText = styled.div`
  font-family: var(--app-font);
  font-size: 12px;
  color: var(--app-muted);
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
  const [week,setWeek]=useState([]);
  const [streak,setStreak]=useState(0);
  const [evData, setEvData] = useState([]);

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
          .select('score, created_at')
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
      const consecutiveDays = calculateConsecutiveDays(allScores);
      const counts = new Map();
      allScores.forEach(ev => { const key = new Date(ev.created_at).toDateString(); counts.set(key,(counts.get(key)||0)+1); });
      setWeek(Array.from({length:7},(_,i)=>{const d=new Date(); d.setDate(d.getDate()-6+i); return {label:d.toLocaleDateString('pt-BR',{weekday:'short'}),count:counts.get(d.toDateString())||0};}));
      const cursor=new Date(); if(!counts.has(cursor.toDateString())) cursor.setDate(cursor.getDate()-1); let streak=0; while(counts.has(cursor.toDateString())){streak++;cursor.setDate(cursor.getDate()-1);} setStreak(streak);

      setUserStats({
        total_evs,
        total_points,
        average_score,
        max_score,
        consecutive_days: consecutiveDays
      });

      // Carregar total de EVs da comunidade (mesmo método da janelinha)
      const { data: community, error: communityError } = await supabase
        .rpc('get_community_ev_statistics').single();
      if (communityError) throw communityError;
      const communityTotalEVs = Number(community.total);
      const community_average_score = Number(community.average_score).toFixed(1);

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

  return (
    <Container>
      <Title>Progresso</Title>
      <StatsGrid><StatCard><StatValue>{streak}</StatValue><StatLabel>Sequência atual (dias)</StatLabel></StatCard><StatCard><StatValue>{userStats.total_evs}</StatValue><StatLabel>Total de EVs</StatLabel></StatCard></StatsGrid>
      <section style={{background:'var(--app-card)',border:'1px solid var(--app-border)',borderRadius:'calc(20px * var(--app-roundness))',padding:20,marginBottom:20}}><h2 style={{fontSize:18}}>Últimos 7 dias</h2><div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:8,alignItems:'end',maxWidth:500,margin:'auto'}}>{week.map((day,i)=><div key={i} style={{display:'grid',gap:5,justifyItems:'center',fontSize:12}}><span>{day.count}</span><div style={{height:Math.max(3,day.count/Math.max(20,...week.map(d=>d.count))*90),width:'65%',background:i===6?'#237e70':'var(--app-chart)',borderRadius:5}}/><span>{day.label}</span></div>)}</div></section>
      <section style={{background:'var(--app-card)',border:'1px solid var(--app-border)',borderRadius:'calc(20px * var(--app-roundness))',padding:20,marginBottom:20}}><h2 style={{fontSize:18}}>EVs recentes</h2>{evData.length===0?<p>Nenhum EV registrado ainda.</p>:evData.slice(0,10).map((ev,i)=><div key={i} style={{padding:'12px 0',borderBottom:'1px solid var(--app-border)',overflowWrap:'anywhere'}}><strong style={{color:'var(--app-link)'}}>EV {ev.score}</strong> <small>{formatDate(ev.created_at)}</small>{ev.notes&&<p>{ev.notes}</p>}</div>)}</section>
      
      <SectionTitle>Minhas Estatísticas</SectionTitle>
      <StatsGrid>

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
          <StatLabel>Maior sequência (dias)</StatLabel>
        </StatCard>
      </StatsGrid>

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