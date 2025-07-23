import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import DailyReportTester from '../components/DailyReportTester';
import WelcomeEmailTester from '../components/WelcomeEmailTester';

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

const AdminWarning = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid #ff0000;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
`;

const WarningText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ff0000;
  margin-bottom: 10px;
`;

const SubText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #cccccc;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
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
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Button = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  padding: 10px 20px;
  border: 2px solid #4a8a4a;
  background: ${props => props.loading ? '#2a4a2a' : '#4a8a4a'};
  color: #ffffff;
  border-radius: 6px;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-right: 10px;
  margin-bottom: 10px;

  &:hover:not(:disabled) {
    background: #6aaa6a;
    border-color: #6aaa6a;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const DangerButton = styled(Button)`
  border-color: #8a4a4a;
  background: ${props => props.loading ? '#4a2a2a' : '#8a4a4a'};

  &:hover:not(:disabled) {
    background: #aa6a6a;
    border-color: #aa6a6a;
  }
`;

const InfoText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  margin-top: 15px;
  line-height: 1.4;
`;

const StatusText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: ${props => props.success ? '#4a8a4a' : props.error ? '#8a4a4a' : '#6a6a6a'};
  margin-top: 10px;
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
`;

const StatValue = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #6a6a6a;
  text-transform: uppercase;
`;

const Dev = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    checkAdminStatus();
    loadSystemStats();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setIsAdmin(profile?.is_admin || false);
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      // Estatísticas gerais do sistema
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { count: totalEVs } = await supabase
        .from('evs')
        .select('*', { count: 'exact' });

      const { count: totalBadges } = await supabase
        .from('badges')
        .select('*', { count: 'exact' });

      // EVs de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayEVs } = await supabase
        .from('evs')
        .select('*', { count: 'exact' })
        .gte('created_at', today.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalEVs: totalEVs || 0,
        totalBadges: totalBadges || 0,
        todayEVs: todayEVs || 0
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const testDailyReports = async () => {
    setLoading(true);
    setStatus('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/daily-reports`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('✅ Relatórios diários processados com sucesso!');
        toast.success('Relatórios processados!');
      } else {
        setStatus(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
        toast.error('Erro ao processar relatórios');
      }

    } catch (error) {
      console.error('Erro ao testar relatórios:', error);
      setStatus(`❌ Erro de conexão: ${error.message}`);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!window.confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados do sistema! Tem certeza?')) {
      return;
    }

    if (!window.confirm('⚠️ ÚLTIMA CHANCE: Todos os EVs, usuários e badges serão perdidos! Confirmar?')) {
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      // Apagar todos os dados (apenas para desenvolvimento)
      await supabase.from('user_badges').delete().neq('id', 0);
      await supabase.from('evs').delete().neq('id', 0);
      await supabase.from('profiles').delete().neq('user_id', user.id); // Manter apenas o admin

      setStatus('🗑️ Todos os dados foram apagados!');
      toast.success('Dados apagados!');
      loadSystemStats(); // Recarregar estatísticas

    } catch (error) {
      console.error('Erro ao apagar dados:', error);
      setStatus(`❌ Erro: ${error.message}`);
      toast.error('Erro ao apagar dados');
    } finally {
      setLoading(false);
    }
  };

  const resetBadges = async () => {
    if (!window.confirm('Isso irá remover todos os badges dos usuários. Continuar?')) {
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await supabase.from('user_badges').delete().neq('id', 0);
      setStatus('🔄 Badges resetados!');
      toast.success('Badges resetados!');

    } catch (error) {
      console.error('Erro ao resetar badges:', error);
      setStatus(`❌ Erro: ${error.message}`);
      toast.error('Erro ao resetar badges');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>Carregando...</Title>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container>
        <AdminWarning>
          <WarningText>🚫 ACESSO NEGADO</WarningText>
          <SubText>Esta área é restrita apenas para administradores</SubText>
        </AdminWarning>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🔧 Área de Desenvolvimento</Title>

      <Grid>
        <Card>
          <CardTitle>📊 Estatísticas do Sistema</CardTitle>
          
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalUsers}</StatValue>
              <StatLabel>Usuários</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.totalEVs}</StatValue>
              <StatLabel>EVs Totais</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.totalBadges}</StatValue>
              <StatLabel>Badges</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.todayEVs}</StatValue>
              <StatLabel>EVs Hoje</StatLabel>
            </StatCard>
          </StatsGrid>

          <Button onClick={loadSystemStats} disabled={loading}>
            🔄 Atualizar
          </Button>
        </Card>

        <Card>
          <CardTitle>📧 Relatórios Diários</CardTitle>
          
          <Button onClick={testDailyReports} disabled={loading}>
            🚀 Testar Sistema
          </Button>

          <InfoText>
            Testa o sistema completo de relatórios diários
            <br />
            Envia relatórios para todos os usuários
          </InfoText>

          {status && (
            <StatusText 
              success={status.includes('✅')}
              error={status.includes('❌')}
            >
              {status}
            </StatusText>
          )}
        </Card>

        <Card>
          <CardTitle>⚠️ Ferramentas Perigosas</CardTitle>
          
          <DangerButton onClick={resetBadges} disabled={loading}>
            🔄 Resetar Badges
          </DangerButton>

          <DangerButton onClick={clearAllData} disabled={loading}>
            🗑️ Apagar Todos os Dados
          </DangerButton>

          <InfoText>
            ⚠️ Use com cuidado! Estas ações são irreversíveis
            <br />
            • Resetar Badges: Remove todos os badges dos usuários
            <br />
            • Apagar Dados: Remove EVs, usuários e badges
          </InfoText>
        </Card>
      </Grid>

      <DailyReportTester />
      <WelcomeEmailTester />
    </Container>
  );
};

export default Dev; 