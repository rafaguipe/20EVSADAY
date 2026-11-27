import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SyncContext = createContext();
const key = 'evs_pending_v2';
const readQueue = () => {
  const queue = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(queue)) throw new Error('Invalid offline queue');
  return queue;
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within a SyncProvider');
  return context;
};

export const SyncProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingEVs, setPendingEVs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncing = useRef(false);
  const loadPendingEVs = useCallback(() => {
    try {
      setPendingEVs(readQueue().filter(ev => ev.user_id === userId));
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }, [userId]);

  const saveEVOffline = (score, notes) => {
    try {
      if (!userId) throw new Error('Usuário não identificado');
      const newEV = {
        id: crypto.randomUUID(),
        user_id: userId,
        score, notes,
        timestamp: new Date().toISOString(),
        synced: false
      };
      localStorage.setItem(key, JSON.stringify([...readQueue(), newEV]));
      loadPendingEVs();
      toast.success('EV registrado offline! Será sincronizado quando a conexão voltar.');
      return { success: true, data: newEV };
    } catch (error) {
      toast.error('Erro ao salvar EV offline');
      return { success: false, error: error.message };
    }
  };

  const syncPendingEVs = useCallback(async () => {
    if (!userId || !navigator.onLine || syncing.current) return;
    syncing.current = true;
    setIsSyncing(true);
    let syncedCount = 0;
    let failedCount = 0;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || data?.user?.id !== userId) return;
      for (const ev of readQueue().filter(ev => ev.user_id === userId)) {
        try {
          const { error } = await supabase.from('evs').upsert({
            user_id: userId, sync_id: ev.id, score: ev.score,
            notes: ev.notes, created_at: ev.timestamp
          }, { onConflict: 'user_id,sync_id', ignoreDuplicates: true });
          if (error) throw error;
          localStorage.setItem(key, JSON.stringify(readQueue().filter(item =>
            !(item.user_id === userId && item.id === ev.id))));
          syncedCount++;
        } catch (error) {
          failedCount++;
          console.error('Error syncing EV:', error);
        }
      }
      if (syncedCount) toast.success(syncedCount + ' EVs sincronizados com sucesso!');
      if (failedCount) toast.error(failedCount + ' EVs permanecem pendentes.');
    } catch (error) {
      console.error('Error during sync:', error);
      toast.error('Erro durante a sincronização');
    } finally {
      loadPendingEVs();
      syncing.current = false;
      setIsSyncing(false);
    }
  }, [userId, loadPendingEVs]);

  useEffect(() => {
    const online = () => { setIsOnline(true); syncPendingEVs(); };
    const offline = () => setIsOnline(false);
    const storage = event => { if (event.key === key) loadPendingEVs(); };
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    window.addEventListener('storage', storage);
    loadPendingEVs();
    syncPendingEVs();
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
      window.removeEventListener('storage', storage);
    };
  }, [loadPendingEVs, syncPendingEVs]);

  const manualSync = async () => {
    if (!navigator.onLine) { toast.error('Sem conexão com a internet'); return; }
    await syncPendingEVs();
  };

  return <SyncContext.Provider value={{
    isOnline, pendingEVs, isSyncing, saveEVOffline,
    syncPendingEVs, manualSync, loadPendingEVs
  }}>{children}</SyncContext.Provider>;
};
