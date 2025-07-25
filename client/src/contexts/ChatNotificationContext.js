import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const ChatNotificationContext = createContext();

export const useChatNotification = () => {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error('useChatNotification must be used within a ChatNotificationProvider');
  }
  return context;
};

export const ChatNotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadAt, setLastReadAt] = useState(null);
  const { user } = useAuth();

  // Load last read timestamp from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`chat_last_read_${user.id}`);
      if (stored) {
        setLastReadAt(new Date(stored));
      } else {
        // Se não tem timestamp salvo, usar 1 hora atrás
        setLastReadAt(new Date(Date.now() - 60 * 60 * 1000));
      }
    }
  }, [user]);

  // Subscribe to new messages (menos agressivo)
  useEffect(() => {
    if (!user || !lastReadAt) return;

    console.log('🔔 Iniciando subscription do chat...');

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_ev_messages'
        },
        (payload) => {
          console.log('📨 Nova mensagem detectada:', payload);
          // Only count messages from other users
          if (payload.new.user_id !== user.id) {
            updateUnreadCount();
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da subscription:', status);
      });

    // Initial count
    updateUnreadCount();

    return () => {
      console.log('🔕 Removendo subscription do chat...');
      supabase.removeChannel(channel);
    };
  }, [user, lastReadAt]);

  const updateUnreadCount = async () => {
    if (!user || !lastReadAt) return;

    try {
      console.log('🔍 Atualizando contagem de mensagens não lidas...');
      
      const { data, error } = await supabase
        .from('chat_ev_messages')
        .select('id')
        .gt('created_at', lastReadAt.toISOString())
        .neq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao buscar mensagens não lidas:', error);
        return;
      }

      const count = data?.length || 0;
      console.log(`📊 Mensagens não lidas: ${count}`);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Erro ao atualizar contagem:', error);
    }
  };

  const markAsRead = async () => {
    if (!user) return;

    console.log('✅ Marcando mensagens como lidas...');
    
    const now = new Date();
    setLastReadAt(now);
    setUnreadCount(0);
    
    // Save to localStorage
    localStorage.setItem(`chat_last_read_${user.id}`, now.toISOString());
    
    console.log('✅ Mensagens marcadas como lidas');
  };

  const value = {
    unreadCount,
    markAsRead,
    updateUnreadCount
  };

  return (
    <ChatNotificationContext.Provider value={value}>
      {children}
    </ChatNotificationContext.Provider>
  );
}; 