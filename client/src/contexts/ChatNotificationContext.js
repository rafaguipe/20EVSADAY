import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const subscriptionRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Load last read timestamp from localStorage (only once)
  useEffect(() => {
    if (user && !isInitializedRef.current) {
      const stored = localStorage.getItem(`chat_last_read_${user.id}`);
      if (stored) {
        setLastReadAt(new Date(stored));
      } else {
        // Se não tem timestamp salvo, usar 1 hora atrás
        setLastReadAt(new Date(Date.now() - 60 * 60 * 1000));
      }
      isInitializedRef.current = true;
    }
  }, [user]);

  const updateUnreadCount = useCallback(async () => {
    if (!user || !lastReadAt) return;

    try {
      const { data, error } = await supabase
        .from('chat_ev_messages')
        .select('id')
        .gt('created_at', lastReadAt.toISOString())
        .neq('user_id', user.id);

      if (error) {
        console.error('Erro ao buscar mensagens não lidas:', error);
        return;
      }

      const count = data?.length || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao atualizar contagem:', error);
    }
  }, [user, lastReadAt]);

  // Subscribe to new messages (only when user and lastReadAt are stable)
  useEffect(() => {
    if (!user || !lastReadAt || !isInitializedRef.current) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

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
          // Only count messages from other users
          if (payload.new.user_id !== user.id) {
            updateUnreadCount();
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    // Initial count
    updateUnreadCount();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, lastReadAt?.getTime(), updateUnreadCount]);

  const markAsRead = useCallback(async () => {
    if (!user) return;
    
    const now = new Date();
    setLastReadAt(now);
    setUnreadCount(0);
    
    // Save to localStorage
    localStorage.setItem(`chat_last_read_${user.id}`, now.toISOString());
  }, [user]);

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