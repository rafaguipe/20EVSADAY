import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const Container = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
`;

const Title = styled.h2`
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

const WelcomeEmailTester = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const testWelcomeEmail = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      // Get the current session to get the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sessão não encontrada');
      }

      console.log('Session found:', !!session);
      console.log('User ID:', user.id);

      const response = await fetch(
        `https://mbxefiadqcrzqbrfkvxu.supabase.co/functions/v1/welcome-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setStatus('✅ Email de boas-vindas enviado com sucesso!');
        toast.success('Email de boas-vindas enviado!');
      } else {
        setStatus(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
        toast.error('Erro ao enviar email de boas-vindas');
      }

    } catch (error) {
      console.error('Erro ao testar email de boas-vindas:', error);
      setStatus(`❌ Erro de conexão: ${error.message}`);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const checkWelcomeEmailLogs = async () => {
    setLoading(true);
    setStatus('');

    try {
      const { data, error } = await supabase
        .from('welcome_email_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        setStatus(`📧 ${data.length} email(s) de boas-vindas enviado(s)`);
        console.log('Logs de email de boas-vindas:', data);
      } else {
        setStatus('📧 Nenhum email de boas-vindas enviado ainda');
      }

    } catch (error) {
      console.error('Erro ao verificar logs:', error);
      setStatus(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Title>📧 Teste de Email de Boas-vindas</Title>
      
      <Button onClick={testWelcomeEmail} disabled={loading}>
        🚀 Enviar Email de Boas-vindas
      </Button>

      <Button onClick={checkWelcomeEmailLogs} disabled={loading}>
        📋 Verificar Logs
      </Button>

      <Button 
        onClick={() => {
          const script = `
console.log('=== TESTE DIRETO ===');
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  console.log('✅ Logado:', session.user.email);
  const response = await fetch('https://mbxefiadqcrzqbrfkvxu.supabase.co/functions/v1/welcome-email', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${session.access_token}\`, 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  console.log('Status:', response.status, 'Data:', data);
} else {
  console.log('❌ Não logado');
}
          `;
          console.log('Script copiado! Cole no console (F12):');
          console.log(script);
          navigator.clipboard.writeText(script);
          toast.success('Script copiado! Cole no console (F12)');
        }}
      >
        📋 Copiar Script de Teste
      </Button>

      <InfoText>
        Este componente permite testar o sistema de email de boas-vindas
        <br />
        • Enviar Email: Envia um email de boas-vindas para seu email
        <br />
        • Verificar Logs: Mostra histórico de emails enviados
        <br />
        • O email é enviado automaticamente após validação do email
      </InfoText>

      {status && (
        <StatusText 
          success={status.includes('✅')}
          error={status.includes('❌')}
        >
          {status}
        </StatusText>
      )}
    </Container>
  );
};

export default WelcomeEmailTester; 