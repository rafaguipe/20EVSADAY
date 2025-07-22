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

  // Carregar intervalo do perfil
  useEffect(() => {
    const fetchInterval = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('ev_interval_minutes')
          .eq('user_id', user.id)
          .single();
        if (data?.ev_interval_minutes) {
          setIntervalMinutes(data.ev_interval_minutes);
          setTimer(data.ev_interval_minutes * 60);
        } else {
          setIntervalMinutes(25);
          setTimer(25 * 60);
        }
      }
    };
    fetchInterval();
  }, [user]);

  // Cronômetro regressivo
  useEffect(() => {
    if (!user) return;
    if (timer <= 0) {
      setShouldTriggerReminder(true);
      setTimer(intervalMinutes * 60); // reinicia
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timer, intervalMinutes, user]);

  // Função para consumir o lembrete
  const consumeReminder = () => setShouldTriggerReminder(false);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <EVTimerContext.Provider value={{ timer, formatTime, intervalMinutes, shouldTriggerReminder, consumeReminder }}>
      {children}
    </EVTimerContext.Provider>
  );
};

export const useEVTimer = () => useContext(EVTimerContext); 