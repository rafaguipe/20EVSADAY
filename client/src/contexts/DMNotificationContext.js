import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

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
  const [isConnected, setIsConnected] = useState(false);

  // Carregar contagem inicial de DMs não lidas
  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  // Configurar Realtime para DMs
  useEffect(() => {
    if (!user) return;

    const setupRealtime = async () => {
      try {
        // Inscrever para mudanças na tabela de DMs
        const channel = supabase
          .channel('dm_notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_ev_direct_messages',
              filter: `receiver_id=eq.${user.id}`
            },
            (payload) => {
              console.log('🔔 Nova DM recebida:', payload);
              handleNewDM(payload.new);
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
              console.log('🔄 DM atualizada:', payload);
              handleDMUpdate(payload.new);
            }
          )
          .subscribe((status) => {
            console.log('📡 Status do canal DM:', status);
            setIsConnected(status === 'SUBSCRIBED');
          });

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Erro ao configurar Realtime para DMs:', error);
      }
    };

    setupRealtime();
  }, [user]);

  // Carregar contagem de DMs não lidas
  const loadUnreadCount = async () => {
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
    }
  };

  // Lidar com nova DM recebida
  const handleNewDM = (newDM) => {
    console.log('🎉 Nova DM recebida de:', newDM.sender_id);
    
    // Atualizar contagem
    setUnreadDMs(prev => prev + 1);
    
    // Salvar notificação
    setLastDMNotification({
      id: newDM.id,
      sender_id: newDM.sender_id,
      message: newDM.message,
      timestamp: new Date()
    });

    // Mostrar toast de notificação
    showDMNotification(newDM);
  };

  // Lidar com atualização de DM
  const handleDMUpdate = (updatedDM) => {
    // Se a DM foi marcada como lida, atualizar contagem
    if (updatedDM.is_read) {
      setUnreadDMs(prev => Math.max(0, prev - 1));
    }
  };

  // Mostrar notificação toast
  const showDMNotification = async (dm) => {
    try {
      // Buscar username do remetente
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', dm.sender_id)
        .single();

      const senderName = profile?.username || 'Usuário';
      
      // Mostrar toast
      toast.success(
        `💬 Nova mensagem de ${senderName}`,
        {
          duration: 5000,
          icon: '💬',
          style: {
            background: '#9C27B0',
            color: 'white',
            fontFamily: 'Press Start 2P, monospace'
          }
        }
      );
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      // Fallback sem username
      toast.success('💬 Nova mensagem privada!', {
        duration: 5000,
        icon: '💬',
        style: {
          background: '#9C27B0',
          color: 'white',
          fontFamily: 'Press Start 2P, monospace'
        }
      });
    }
  };

  // Marcar DMs como lidas
  const markDMsAsRead = async (senderId) => {
    try {
      const { error } = await supabase.rpc('mark_dm_as_read', {
        conversation_user_id: senderId
      });

      if (error) {
        console.error('Erro ao marcar DMs como lidas:', error);
        return;
      }

      // Atualizar contagem local
      await loadUnreadCount();
    } catch (error) {
      console.error('Erro ao marcar DMs como lidas:', error);
    }
  };

  // Limpar notificação
  const clearNotification = () => {
    setLastDMNotification(null);
  };

  const value = {
    unreadDMs,
    lastDMNotification,
    isConnected,
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
