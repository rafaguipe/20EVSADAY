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
      }
    }
  }, [user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

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

    // Initial count
    updateUnreadCount();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, lastReadAt]);

  const updateUnreadCount = async () => {
    if (!user || !lastReadAt) return;

    try {
      const { data, error } = await supabase
        .from('chat_ev_messages')
        .select('id')
        .gt('created_at', lastReadAt.toISOString())
        .neq('user_id', user.id);

      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }

      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  };

  const markAsRead = async () => {
    if (!user) return;

    const now = new Date();
    setLastReadAt(now);
    setUnreadCount(0);
    
    // Save to localStorage
    localStorage.setItem(`chat_last_read_${user.id}`, now.toISOString());
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