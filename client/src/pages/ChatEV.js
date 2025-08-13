import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useChatNotification } from '../contexts/ChatNotificationContext';
import { useDMNotification } from '../contexts/DMNotificationContext';
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
  const { markDMsAsRead } = useDMNotification();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('encouragement');
  const messagesEndRef = useRef(null);
  
  // Estados para DM
  const [showDMForm, setShowDMForm] = useState(false);
  const [dmReceiver, setDmReceiver] = useState(null);
  const [dmMessage, setDmMessage] = useState('');
  const [dmMessageType, setDmMessageType] = useState('encouragement');
  const [sendingDM, setSendingDM] = useState(false);
  const [dmConversations, setDmConversations] = useState([]);
  const [showDMList, setShowDMList] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [loadingDM, setLoadingDM] = useState(false);

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

  // Funções para DM
  const loadDMConversations = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_dm_conversations', { user_uuid: user.id });

      if (error) {
        console.error('Erro ao carregar conversas DM:', error);
        return;
      }

      setDmConversations(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas DM:', error);
    }
  };

  const loadDMConversation = async (otherUserId) => {
    try {
      setLoadingDM(true);
      
      const { data, error } = await supabase
        .rpc('get_dm_conversation', { 
          user1_uuid: user.id, 
          user2_uuid: otherUserId, 
          limit_count: 50 
        });

      if (error) {
        console.error('Erro ao carregar conversa DM:', error);
        toast.error('Erro ao carregar conversa');
        return;
      }

      setDmMessages(data || []);
      setSelectedConversation(otherUserId);
      
      // Marcar mensagens como lidas usando o contexto
      await markDMsAsRead(otherUserId);
    } catch (error) {
      console.error('Erro ao carregar conversa DM:', error);
    } finally {
      setLoadingDM(false);
    }
  };

  const sendDM = async (e) => {
    e.preventDefault();
    
    if (!dmMessage.trim() || !dmReceiver) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setSendingDM(true);
      
      const dmData = {
        sender_id: user.id,
        receiver_id: dmReceiver.id,
        message: dmMessage.trim(),
        message_type: dmMessageType
      };

      const { error } = await supabase
        .from('chat_ev_direct_messages')
        .insert(dmData);

      if (error) {
        console.error('Erro ao enviar DM:', error);
        toast.error('Erro ao enviar mensagem privada');
        return;
      }

      // Limpar formulário
      setDmMessage('');
      setDmMessageType('encouragement');
      setShowDMForm(false);
      setDmReceiver(null);
      
      // Recarregar conversas
      await loadDMConversations();
      
      toast.success('Mensagem privada enviada!');
    } catch (error) {
      console.error('Erro ao enviar DM:', error);
      toast.error('Erro ao enviar mensagem privada');
    } finally {
      setSendingDM(false);
    }
  };

  const openDMForm = (receiver) => {
    setDmReceiver(receiver);
    setShowDMForm(true);
    setShowDMList(false);
  };

  const closeDMForm = () => {
    setShowDMForm(false);
    setDmReceiver(null);
    setDmMessage('');
    setDmMessageType('encouragement');
  };

  const openDMList = () => {
    setShowDMList(true);
    setShowDMForm(false);
    setSelectedConversation(null);
    loadDMConversations();
  };

  const closeDMList = () => {
    setShowDMList(false);
    setSelectedConversation(null);
    setDmMessages([]);
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
              
              {/* Botão DM - não mostrar para mensagens próprias */}
              {!message.is_own_message && (
                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                  <button
                    onClick={() => openDMForm({
                      id: message.user_id,
                      username: message.username
                    })}
                    style={{
                      background: '#9C27B0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontFamily: 'Press Start 2P, monospace'
                    }}
                  >
                    💬 DM
                  </button>
                </div>
              )}
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

      {/* Botões de navegação DM */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center', 
        marginTop: '20px' 
      }}>
        <button
          onClick={openDMList}
          style={{
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'Press Start 2P, monospace'
          }}
        >
          💬 Minhas Conversas
        </button>
      </div>

      {/* Formulário de DM */}
      {showDMForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#2a2a2a',
            border: '2px solid #9C27B0',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                color: '#9C27B0', 
                margin: 0,
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '14px'
              }}>
                💬 Mensagem Privada para {dmReceiver?.username}
              </h3>
              <button
                onClick={closeDMForm}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={sendDM}>
              <MessageTypeSelect
                value={dmMessageType}
                onChange={(e) => setDmMessageType(e.target.value)}
                style={{ marginBottom: '15px' }}
              >
                {messageTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </MessageTypeSelect>

              <MessageTextarea
                value={dmMessage}
                onChange={(e) => setDmMessage(e.target.value)}
                placeholder={`Digite sua mensagem privada para ${dmReceiver?.username}...`}
                maxLength={1000}
                style={{ marginBottom: '15px' }}
              />

              <SubmitButton 
                type="submit" 
                disabled={sendingDM || !dmMessage.trim()}
                style={{ width: '100%' }}
              >
                {sendingDM ? 'Enviando...' : '📤 Enviar DM'}
              </SubmitButton>
            </form>
          </div>
        </div>
      )}

      {/* Lista de conversas DM */}
      {showDMList && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#2a2a2a',
            border: '2px solid #9C27B0',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                color: '#9C27B0', 
                margin: 0,
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '14px'
              }}>
                💬 Minhas Conversas Privadas
              </h3>
              <button
                onClick={closeDMList}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {dmConversations.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                <p>Nenhuma conversa privada ainda</p>
                <p>Use o botão 💬 DM em uma mensagem para iniciar</p>
              </div>
            ) : (
              <div>
                {dmConversations.map((conv) => (
                  <div
                    key={conv.conversation_id}
                    onClick={() => loadDMConversation(conv.other_user_id)}
                    style={{
                      background: '#3a3a3a',
                      border: '1px solid #4a4a4a',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      borderLeft: conv.unread_count > 0 ? '4px solid #9C27B0' : '1px solid #4a4a4a'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <strong style={{ color: '#9C27B0' }}>{conv.other_username}</strong>
                      {conv.unread_count > 0 && (
                        <span style={{
                          background: '#9C27B0',
                          color: 'white',
                          borderRadius: '50%',
                          padding: '2px 6px',
                          fontSize: '10px',
                          minWidth: '16px',
                          textAlign: 'center'
                        }}>
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p style={{ 
                      color: '#ccc', 
                      fontSize: '12px', 
                      margin: '5px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {conv.last_message}
                    </p>
                    <small style={{ color: '#666', fontSize: '10px' }}>
                      {formatTime(conv.last_message_time)}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visualização de conversa DM */}
      {selectedConversation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#2a2a2a',
            border: '2px solid #9C27B0',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                color: '#9C27B0', 
                margin: 0,
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '14px'
              }}>
                💬 Conversa com {dmConversations.find(c => c.other_user_id === selectedConversation)?.other_username || 'Usuário'}
              </h3>
              <button
                onClick={closeDMList}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {loadingDM ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <LoadingSpinner>Carregando conversa...</LoadingSpinner>
              </div>
            ) : (
              <div>
                {dmMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                    <p>Nenhuma mensagem nesta conversa</p>
                  </div>
                ) : (
                  <div style={{ marginBottom: '20px' }}>
                    {dmMessages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          background: msg.is_own_message ? 'rgba(74, 106, 138, 0.2)' : '#3a3a3a',
                          border: '1px solid',
                          borderColor: msg.is_own_message ? '#4a6a8a' : '#4a4a4a',
                          borderRadius: '8px',
                          padding: '10px',
                          marginBottom: '10px',
                          textAlign: msg.is_own_message ? 'right' : 'left'
                        }}
                      >
                        <div style={{ 
                          fontSize: '10px', 
                          color: '#666',
                          marginBottom: '5px'
                        }}>
                          {msg.is_own_message ? 'Você' : dmConversations.find(c => c.other_user_id === selectedConversation)?.other_username || 'Usuário'}
                          {' • '}
                          {formatTime(msg.created_at)}
                        </div>
                        <div style={{ color: '#fff', fontSize: '12px' }}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </ChatContainer>
  );
};

export default ChatEV; 