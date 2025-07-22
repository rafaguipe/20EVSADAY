import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const EVTimerContext = createContext();

export const EVTimerProvider = ({ children }) => {
  const { user } = useAuth();
  const [intervalMinutes, setIntervalMinutes] = useState(25);
  const [timer, setTimer] = useState(intervalMinutes * 60); // segundos
  const [shouldTriggerReminder, setShouldTriggerReminder] = useState(false);
  const timerRef = useRef();
  const audioRef = useRef();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Carregar intervalo e preferência de som do perfil
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('ev_interval_minutes, sound_enabled')
          .eq('user_id', user.id)
          .single();
        
        if (data?.ev_interval_minutes) {
          setIntervalMinutes(data.ev_interval_minutes);
          // Carregar timer salvo ou usar o padrão
          const savedTimer = localStorage.getItem(`ev_timer_${user.id}`);
          if (savedTimer) {
            const savedTime = parseInt(savedTimer);
            const now = Date.now();
            const elapsed = Math.floor((now - savedTime) / 1000);
            const remaining = (data.ev_interval_minutes * 60) - elapsed;
            setTimer(Math.max(0, remaining));
          } else {
            setTimer(data.ev_interval_minutes * 60);
          }
        } else {
          setIntervalMinutes(25);
          setTimer(25 * 60);
        }
        
        if (data?.sound_enabled !== undefined) {
          setSoundEnabled(data.sound_enabled);
        }
      }
    };
    fetchUserPreferences();
  }, [user]);

  // Salvar timer no localStorage
  useEffect(() => {
    if (user && timer > 0) {
      const now = Date.now();
      const startTime = now - ((intervalMinutes * 60 - timer) * 1000);
      localStorage.setItem(`ev_timer_${user.id}`, startTime.toString());
    }
  }, [timer, user, intervalMinutes]);

  // Cronômetro regressivo
  useEffect(() => {
    if (!user) return;
    if (timer <= 0) {
      // Tocar som apenas se estiver habilitado
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Erro ao tocar som:', e));
      }
      setShouldTriggerReminder(true);
      setTimer(intervalMinutes * 60); // reinicia
      // Limpar timer salvo quando reiniciar
      localStorage.removeItem(`ev_timer_${user.id}`);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timer, intervalMinutes, user, soundEnabled]);

  // Função para consumir o lembrete
  const consumeReminder = () => setShouldTriggerReminder(false);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const updateInterval = (newInterval) => {
    setIntervalMinutes(newInterval);
    setTimer(newInterval * 60);
  };

  return (
    <EVTimerContext.Provider value={{ 
      timer, 
      formatTime, 
      intervalMinutes, 
      shouldTriggerReminder, 
      consumeReminder,
      updateInterval,
      soundEnabled 
    }}>
      <audio ref={audioRef} src="/sounds/reminder.mp3" preload="auto" />
      {children}
    </EVTimerContext.Provider>
  );
};

export const useEVTimer = () => useContext(EVTimerContext); 