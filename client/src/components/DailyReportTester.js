import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const Container = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

const Title = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
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

const DailyReportTester = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const testDailyReport = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para testar');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      // Chamar a Edge Function de relatórios diários
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/daily-reports`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            test_user_id: user.id,
            test_mode: true
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('✅ Relatório de teste enviado com sucesso! Verifique seu email.');
        toast.success('Relatório de teste enviado!');
      } else {
        setStatus(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
        toast.error('Erro ao enviar relatório de teste');
      }

    } catch (error) {
      console.error('Erro ao testar relatório:', error);
      setStatus(`❌ Erro de conexão: ${error.message}`);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const testReportGeneration = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para testar');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      // Gerar relatório localmente para teste
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Buscar EVs do usuário
      const { data: userEVs, error } = await supabase
        .from('evs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!userEVs || userEVs.length === 0) {
        setStatus('ℹ️ Você ainda não registrou EVs para gerar um relatório.');
        return;
      }

      // Calcular estatísticas
      const totalEVs = userEVs.length;
      const totalPoints = userEVs.reduce((sum, ev) => sum + ev.score, 0);
      const averageScore = (totalPoints / totalEVs).toFixed(1);

      setStatus(`📊 Relatório gerado: ${totalEVs} EVs, ${totalPoints} pontos, média ${averageScore}`);
      toast.success('Relatório gerado localmente!');

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setStatus(`❌ Erro: ${error.message}`);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const checkReportLogs = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para verificar logs');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      // Verificar logs de relatórios (se a tabela existir)
      const { data: logs, error } = await supabase
        .from('daily_report_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (error) {
        if (error.code === '42P01') {
          setStatus('ℹ️ Tabela de logs não configurada ainda.');
        } else {
          throw error;
        }
      } else {
        if (logs && logs.length > 0) {
          const lastLog = logs[0];
          setStatus(`📋 Último relatório: ${lastLog.report_date} - Status: ${lastLog.status}`);
        } else {
          setStatus('📋 Nenhum relatório enviado ainda.');
        }
      }

    } catch (error) {
      console.error('Erro ao verificar logs:', error);
      setStatus(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🧪 Teste de Relatórios Diários</Title>
      
      <Button 
        onClick={testDailyReport} 
        loading={loading}
        disabled={loading}
      >
        📧 Testar Envio de Email
      </Button>

      <Button 
        onClick={testReportGeneration} 
        loading={loading}
        disabled={loading}
      >
        📊 Gerar Relatório Local
      </Button>

      <Button 
        onClick={checkReportLogs} 
        loading={loading}
        disabled={loading}
      >
        📋 Verificar Logs
      </Button>

      {status && (
        <StatusText 
          success={status.includes('✅') || status.includes('📊')}
          error={status.includes('❌')}
        >
          {status}
        </StatusText>
      )}

      <InfoText>
        💡 Este componente permite testar o sistema de relatórios diários.
        <br />
        • <strong>Testar Envio de Email:</strong> Envia um relatório real para seu email
        <br />
        • <strong>Gerar Relatório Local:</strong> Gera estatísticas localmente
        <br />
        • <strong>Verificar Logs:</strong> Mostra histórico de relatórios enviados
      </InfoText>
    </Container>
  );
};

export default DailyReportTester; 