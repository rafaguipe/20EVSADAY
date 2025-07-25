import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const SyncContext = createContext();

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingEVs, setPendingEVs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada! Sincronizando dados...');
      syncPendingEVs();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Conexão perdida. Modo offline ativado.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending EVs on mount
    loadPendingEVs();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending EVs from localStorage
  const loadPendingEVs = () => {
    try {
      const stored = localStorage.getItem('evs_pending');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPendingEVs(parsed);
      }
    } catch (error) {
      console.error('Error loading pending EVs:', error);
    }
  };

  // Save EV to localStorage (offline mode)
  const saveEVOffline = (intensity, comment) => {
    try {
      const newEV = {
        id: `local_${Date.now()}_${Math.random()}`,
        intensity,
        comment,
        timestamp: new Date().toISOString(),
        synced: false
      };

      const updated = [...pendingEVs, newEV];
      setPendingEVs(updated);
      localStorage.setItem('evs_pending', JSON.stringify(updated));

      toast.success('EV registrado offline! Será sincronizado quando a conexão voltar.');
      return { success: true, data: newEV };
    } catch (error) {
      console.error('Error saving EV offline:', error);
      toast.error('Erro ao salvar EV offline');
      return { success: false, error: error.message };
    }
  };

  // Sync pending EVs to Supabase
  const syncPendingEVs = async () => {
    if (pendingEVs.length === 0 || !isOnline || isSyncing) return;

    setIsSyncing(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsSyncing(false);
      return;
    }

    try {
      let syncedCount = 0;
      let failedCount = 0;

      for (const ev of pendingEVs) {
        try {
          const { error } = await supabase
            .from('evs')
            .insert({
              user_id: user.id,
              intensity: ev.intensity,
              notes: ev.comment, // Corrigido de 'comment' para 'notes'
              created_at: ev.timestamp
            });

          if (error) {
            console.error('Error syncing EV:', error);
            failedCount++;
          } else {
            syncedCount++;
          }
        } catch (error) {
          console.error('Error syncing EV:', error);
          failedCount++;
        }
      }

      // Clear synced EVs from localStorage
      if (syncedCount > 0) {
        setPendingEVs([]);
        localStorage.removeItem('evs_pending');
        
        toast.success(`${syncedCount} EVs sincronizados com sucesso!`);
        
        // Trigger badge check after sync
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

      if (failedCount > 0) {
        toast.error(`${failedCount} EVs falharam na sincronização`);
      }

    } catch (error) {
      console.error('Error during sync:', error);
      toast.error('Erro durante a sincronização');
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual sync trigger
  const manualSync = async () => {
    if (!isOnline) {
      toast.error('Sem conexão com a internet');
      return;
    }
    await syncPendingEVs();
  };

  const value = {
    isOnline,
    pendingEVs,
    isSyncing,
    saveEVOffline,
    syncPendingEVs,
    manualSync,
    loadPendingEVs
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}; 