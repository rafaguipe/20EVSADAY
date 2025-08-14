import React, { useState, useEffect } from 'react';
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

const StatsContainer = styled.div`
  background: rgba(74, 138, 74, 0.1);
  border: 1px solid #4a8a4a;
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
`;

const StatItem = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffffff;
  margin-bottom: 5px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormContainer = styled.div`
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid #2196F3;
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
`;

const FormTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #2196F3;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const Input = styled.input`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  width: 100%;
  padding: 8px;
  border: 1px solid #2196F3;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  margin-bottom: 10px;
  
  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  width: 100%;
  padding: 8px;
  border: 1px solid #2196F3;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  margin-bottom: 10px;
  min-height: 100px;
  resize: vertical;
  
  &::placeholder {
    color: #999;
  }
`;

const HelpText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.3;
`;

const BulkEmailSender = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [stats, setStats] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const fetchPendingUsers = async () => {
    setLoading(true);
    setStatus('');

    try {
      const { data, error } = await supabase
        .rpc('get_pending_welcome_emails');

      if (error) throw error;

      setStats(data);
      setStatus(`📊 ${data.total_pending} usuários pendentes de email de boas-vindas`);

    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      setStatus(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmails = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      setStatus('🔄 Enviando emails em massa...');

      // Get the current session to get the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch(
        `https://mbxefiadqcrzqbrfkvxu.supabase.co/functions/v1/send-bulk-welcome-emails`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('✅ Emails em massa enviados com sucesso!');
        toast.success('Emails em massa enviados!');
        
        // Atualizar estatísticas
        await fetchPendingUsers();
        
        console.log('✅ Emails em massa enviados:', data);
      } else {
        setStatus(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
        toast.error('Erro ao enviar emails em massa');
        console.error('❌ Erro na resposta:', data);
      }

    } catch (error) {
      console.error('Erro ao enviar emails em massa:', error);
      setStatus(`❌ Erro de conexão: ${error.message}`);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const sendCustomBulkEmails = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error('Assunto e mensagem são obrigatórios');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      setStatus('🔄 Enviando emails personalizados em massa...');

      // Get the current session to get the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch(
        `https://mbxefiadqcrzqbrfkvxu.supabase.co/functions/v1/clever-responder`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ subject, message })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('✅ Emails personalizados enviados com sucesso!');
        toast.success('Emails personalizados enviados!');
        
        // Limpar campos
        setSubject('');
        setMessage('');
        
        console.log('✅ Emails personalizados enviados:', data);
      } else {
        setStatus(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
        toast.error('Erro ao enviar emails personalizados');
        console.error('❌ Erro na resposta:', data);
      }

    } catch (error) {
      console.error('Erro ao enviar emails personalizados:', error);
      setStatus(`❌ Erro de conexão: ${error.message}`);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const sendToSpecificUser = async (userId) => {
    setLoading(true);
    setStatus('');

    try {
      setStatus(`🔄 Enviando email para usuário ${userId}...`);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch(
        `https://mbxefiadqcrzqbrfkvxu.supabase.co/functions/v1/welcome-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userId })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ Email enviado para usuário ${userId}!`);
        toast.success('Email enviado!');
        
        // Atualizar estatísticas
        await fetchPendingUsers();
      } else {
        setStatus(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
        toast.error('Erro ao enviar email');
      }

    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setStatus(`❌ Erro de conexão: ${error.message}`);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPendingUsers();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Title>📧 Envio em Massa de Emails</Title>
      
      <Button onClick={fetchPendingUsers} disabled={loading}>
        📊 Verificar Pendentes
      </Button>

      <Button onClick={sendBulkEmails} disabled={loading}>
        🚀 Enviar Boas-vindas para Todos
      </Button>

      {stats && (
        <StatsContainer>
          <StatItem>📊 Total de usuários: {stats.total_users}</StatItem>
          <StatItem>✅ Já receberam: {stats.already_received}</StatItem>
          <StatItem>⏳ Pendentes: {stats.total_pending}</StatItem>
          <StatItem>📧 Emails válidos: {stats.valid_emails}</StatItem>
        </StatsContainer>
      )}

      <FormContainer>
        <FormTitle>📝 Email Personalizado em Massa</FormTitle>
        
        <HelpText>
          💡 Use {'{usuario}'} no texto para personalizar com o nome do usuário
          <br />
          📧 Enviará para TODOS os usuários cadastrados com email confirmado
        </HelpText>

        <Input
          type="text"
          placeholder="Assunto do email"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <TextArea
          placeholder="Digite sua mensagem aqui... Use {'{usuario}'} para personalizar"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button 
          onClick={sendCustomBulkEmails} 
          disabled={loading || !subject.trim() || !message.trim()}
          style={{ backgroundColor: '#2196F3', borderColor: '#2196F3' }}
        >
          🚀 Enviar Email Personalizado para Todos
        </Button>
      </FormContainer>

      <InfoText>
        Este componente permite enviar emails em massa
        <br />
        • Verificar Pendentes: Mostra quantos usuários não receberam email de boas-vindas
        <br />
        • Enviar Boas-vindas: Envia email de boas-vindas para usuários pendentes
        <br />
        • Email Personalizado: Envia mensagem personalizada para TODA a base de usuários
        <br />
        • O sistema evita enviar emails duplicados de boas-vindas automaticamente
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

export default BulkEmailSender; 