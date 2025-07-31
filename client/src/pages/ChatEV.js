import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useChatNotification } from '../contexts/ChatNotificationContext';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const ChatContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #1a1a1a;
  min-height: calc(100vh - 100px);
`;

const ChatHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(74, 106, 138, 0.1);
  border: 2px solid #4a6a8a;
  border-radius: 12px;
`;

const ChatTitle = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #4a6a8a;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const ChatDescription = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const ChatRules = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const RulesTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffc107;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const RulesList = styled.ul`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffffff;
  line-height: 1.5;
  margin: 0;
  padding-left: 20px;
`;

const MessagesContainer = styled.div`
  background: #2a2a2a;
  border: 2px solid #4a4a4a;
  border-radius: 12px;
  padding: 20px;
  height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
  scroll-behavior: smooth;
`;

const MessageItem = styled.div`
  margin-bottom: 15px;
  padding: 15px;
  background: ${props => props.isOwn ? 'rgba(74, 106, 138, 0.2)' : '#3a3a3a'};
  border: 1px solid ${props => props.isOwn ? '#4a6a8a' : '#4a4a4a'};
  border-radius: 8px;
  position: relative;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4a6a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 10px;
  font-family: 'Press Start 2P', monospace;
`;

const Username = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #4a6a8a;
  font-weight: bold;
`;

const MessageTime = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #666;
  margin-left: auto;
`;

const MessageType = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: ${props => {
    switch(props.type) {
      case 'encouragement': return '#4CAF50';
      case 'orthothought': return '#2196F3';
      case 'experience': return '#FF9800';
      case 'question': return '#9C27B0';
      default: return '#666';
    }
  }};
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 10px;
`;

const MessageText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  line-height: 1.5;
  margin: 0;
  word-wrap: break-word;
`;

const MessageForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: #2a2a2a;
  border: 2px solid #4a4a4a;
  border-radius: 12px;
  padding: 20px;
`;

const MessageTypeSelect = styled.select`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  background: #1a1a1a;
  color: #ffffff;
  border: 2px solid #4a6a8a;
  border-radius: 6px;
  padding: 10px;
  outline: none;
  
  &:focus {
    border-color: #357a6a;
  }
`;

const MessageTextarea = styled.textarea`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  background: #1a1a1a;
  color: #ffffff;
  border: 2px solid #4a6a8a;
  border-radius: 6px;
  padding: 15px;
  min-height: 100px;
  resize: vertical;
  outline: none;
  
  &:focus {
    border-color: #357a6a;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const SubmitButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  background: #4a6a8a;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 15px 30px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #357a6a;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 20px;
  color: #4a6a8a;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
`;

const ChatEV = () => {
  const { user } = useAuth();
  const { markAsRead } = useChatNotification();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('encouragement');
  const messagesEndRef = useRef(null);

  const messageTypes = [
    { value: 'encouragement', label: '💪 Incentivo', emoji: '💪' },
    { value: 'orthothought', label: '💡 Ortopensata', emoji: '💡' },
    { value: 'experience', label: '🌟 Experiência', emoji: '🌟' },
    { value: 'question', label: '❓ Pergunta', emoji: '❓' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when entering chat
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('chat_ev_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast.error('Erro ao carregar mensagens');
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    if (newMessage.length > 1000) {
      toast.error('Mensagem muito longa (máximo 1000 caracteres)');
      return;
    }
    
    try {
      setSending(true);
      
      // Buscar dados do perfil do usuário
      let profile;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          toast.error(`Erro ao buscar dados do perfil: ${profileError.message}`);
          return;
        }

        if (!profileData) {
          console.error('Perfil não encontrado');
          toast.error('Perfil do usuário não encontrado');
          return;
        }

        profile = profileData;
      } catch (profileException) {
        console.error('Exceção ao buscar perfil:', profileException);
        toast.error(`Exceção ao buscar perfil: ${profileException.message}`);
        return;
      }

      // Inserir mensagem diretamente na tabela
      const messageData = {
        user_id: user.id,
        username: profile?.username || 'Usuário',
        avatar_url: profile?.avatar_url || 'avatar_1.png',
        message: newMessage.trim(),
        message_type: messageType,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('chat_ev_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir mensagem:', error);
        toast.error(`Erro ao enviar mensagem: ${error.message}`);
        return;
      }

      // Recarregar mensagens
      await loadMessages();
      
      // Limpar formulário
      setNewMessage('');
      setMessageType('encouragement');
      
      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro geral ao enviar mensagem:', error);
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageTypeLabel = (type) => {
    const typeInfo = messageTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.label : type;
  };

  if (!user) {
    return (
      <ChatContainer>
        <ChatHeader>
          <ChatTitle>💬 Chat EV</ChatTitle>
          <ChatDescription>Faça login para participar do chat sobre Estados Vibracionais!</ChatDescription>
        </ChatHeader>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>💬 Chat EV</ChatTitle>
        <ChatDescription>
          Compartilhe experiências, ortopensatas e incentivos sobre Estados Vibracionais
        </ChatDescription>
        
        <ChatRules>
          <RulesTitle>📋 Regras do Chat</RulesTitle>
          <RulesList>
            <li>✅ Mantenha o foco em Estados Vibracionais</li>
            <li>✅ Seja positivo e respeitoso</li>
            <li>✅ Compartilhe experiências e ortopensatas</li>
            <li>❌ Não use para outros assuntos</li>
            <li>❌ Não seja desrespeitoso</li>
          </RulesList>
        </ChatRules>
      </ChatHeader>

      <MessagesContainer>
        {loading ? (
          <LoadingSpinner>Carregando mensagens...</LoadingSpinner>
        ) : messages.length === 0 ? (
          <EmptyState>
            <div>🌟 Seja o primeiro a compartilhar uma experiência!</div>
            <div>💡 Compartilhe suas ortopensatas sobre EV</div>
          </EmptyState>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} isOwn={message.is_own_message}>
              <MessageHeader>
                <Avatar>👤</Avatar>
                <Username>{message.username}</Username>
                <MessageType type={message.message_type}>
                  {getMessageTypeLabel(message.message_type)}
                </MessageType>
                <MessageTime>{formatTime(message.created_at)}</MessageTime>
              </MessageHeader>
              <MessageText>{message.message}</MessageText>
            </MessageItem>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <MessageForm onSubmit={handleSubmit}>
        <MessageTypeSelect
          value={messageType}
          onChange={(e) => setMessageType(e.target.value)}
        >
          {messageTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.emoji} {type.label}
            </option>
          ))}
        </MessageTypeSelect>

        <MessageTextarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem sobre Estados Vibracionais..."
          maxLength={1000}
        />

        <SubmitButton type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? 'Enviando...' : '📤 Enviar Mensagem'}
        </SubmitButton>
      </MessageForm>
    </ChatContainer>
  );
};

export default ChatEV; 