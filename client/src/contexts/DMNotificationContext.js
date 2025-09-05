import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { DM_CONFIG, isDMEnabled, markCriticalError, clearCriticalError } from '../config/dmConfig';

const DMNotificationContext = createContext();

export const useDMNotification = () => {
  const context = useContext(DMNotificationContext);
  if (!context) {
    throw new Error('useDMNotification deve ser usado dentro de DMNotificationProvider');
  }
  return context;
};

export const DMNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadDMs, setUnreadDMs] = useState(0);
  const [lastDMNotification, setLastDMNotification] = useState(null);
  const [isEnabled, setIsEnabled] = useState(isDMEnabled()); // Controle de segurança
  
  // Usar refs para evitar re-renders desnecessários
  const channelRef = useRef(null);
  const isInitializedRef = useRef(false);
  const errorCountRef = useRef(0);
  const maxErrors = DM_CONFIG.MAX_ERRORS; // Máximo de erros antes de desabilitar

  // Função para carregar contagem de DMs não lidas
  const loadUnreadCount = async () => {
    if (!user || !isEnabled) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_ev_direct_messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Erro ao carregar contagem de DMs:', error);
        return;
      }

      setUnreadDMs(data?.length || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem de DMs:', error);
      handleError();
    }
  };

  // Função para marcar DMs como lidas
  const markDMsAsRead = async (senderId) => {
    if (!user || !isEnabled) return;
    
    try {
      const { error } = await supabase.rpc('mark_dm_as_read', {
        conversation_user_id: senderId
      });

      if (error) {
        console.error('Erro ao marcar DMs como lidas:', error);
        return;
      }

      // Recarregar contagem
      await loadUnreadCount();
    } catch (error) {
      console.error('Erro ao marcar DMs como lidas:', error);
      handleError();
    }
  };

  // Função para limpar notificação
  const clearNotification = () => {
    setLastDMNotification(null);
  };

  // Controle de erro - desabilita funcionalidade se houver muitos erros
  const handleError = () => {
    errorCountRef.current += 1;
    if (errorCountRef.current >= maxErrors) {
      console.warn('🚨 Muitos erros no sistema de DMs. Desabilitando funcionalidade.');
      setIsEnabled(false);
      markCriticalError(); // Marcar erro crítico no localStorage
      // Limpar conexões
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }
  };

  // Configurar Realtime apenas uma vez por usuário
  useEffect(() => {
    if (!user || isInitializedRef.current || !isEnabled) return;

    isInitializedRef.current = true;
    
    const setupRealtime = async () => {
      try {
        // Limpar canal anterior se existir
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }

        // Verificar se a tabela existe antes de criar o canal
        const { data: tableExists, error: tableError } = await supabase
          .from('chat_ev_direct_messages')
          .select('id')
          .limit(1);

        if (tableError) {
          console.error('❌ Tabela chat_ev_direct_messages não existe ou não é acessível:', tableError);
          handleError();
          return;
        }

        // Criar novo canal com timeout
        const channel = supabase
          .channel(`dm_notifications_${user.id}`, {
            config: {
              presence: { key: user.id },
              broadcast: { self: true }
            }
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_ev_direct_messages',
              filter: `receiver_id=eq.${user.id}`
            },
            (payload) => {
              try {
                console.log('🔔 Nova DM recebida:', payload);
                
                // Atualizar contagem
                setUnreadDMs(prev => prev + 1);
                
                // Salvar notificação
                setLastDMNotification({
                  id: payload.new.id,
                  sender_id: payload.new.sender_id,
                  message: payload.new.message,
                  timestamp: new Date()
                });

                // Mostrar toast simples (sem consulta ao banco)
                toast.success('💬 Nova mensagem privada!', {
                  duration: DM_CONFIG.TOAST_DURATION,
                  icon: '💬',
                  style: {
                    background: '#9C27B0',
                    color: 'white',
                    fontFamily: 'Press Start 2P, monospace'
                  }
                });
              } catch (error) {
                console.error('Erro ao processar nova DM:', error);
                handleError();
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'chat_ev_direct_messages',
              filter: `receiver_id=eq.${user.id}`
            },
            (payload) => {
              try {
                // Se a DM foi marcada como lida, atualizar contagem
                if (payload.new.is_read) {
                  setUnreadDMs(prev => Math.max(0, prev - 1));
                }
              } catch (error) {
                console.error('Erro ao processar atualização de DM:', error);
                handleError();
              }
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Status do canal Realtime:', status);
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              console.error('❌ Erro no canal Realtime:', status, err);
              handleError();
            } else if (status === 'SUBSCRIBED') {
              console.log('✅ Canal Realtime conectado com sucesso');
              errorCountRef.current = 0; // Reset contador de erros em caso de sucesso
            }
          });

        channelRef.current = channel;
        
        // Carregar contagem inicial
        await loadUnreadCount();
        
      } catch (error) {
        console.error('Erro ao configurar Realtime para DMs:', error);
        handleError();
        isInitializedRef.current = false;
      }
    };

    // Aguardar um pouco antes de configurar para evitar conflitos
    const timeoutId = setTimeout(setupRealtime, 1000);

    // Cleanup quando o usuário mudar
    return () => {
      clearTimeout(timeoutId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [user?.id, isEnabled]); // user.id e isEnabled como dependências

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []);

  // Reset de erros quando usuário mudar
  useEffect(() => {
    errorCountRef.current = 0;
    clearCriticalError(); // Limpar erro crítico
    setIsEnabled(isDMEnabled()); // Verificar se está habilitado
  }, [user?.id]);

  const value = {
    unreadDMs: isEnabled ? unreadDMs : 0,
    lastDMNotification: isEnabled ? lastDMNotification : null,
    isEnabled,
    loadUnreadCount,
    markDMsAsRead,
    clearNotification
  };

  return (
    <DMNotificationContext.Provider value={value}>
      {children}
    </DMNotificationContext.Provider>
  );
};
