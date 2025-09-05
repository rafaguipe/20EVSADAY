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
  const [tabBlinkEnabled, setTabBlinkEnabled] = useState(true);

  // Carregar intervalo e preferência de som do perfil
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('ev_interval_minutes, sound_enabled, tab_blink_enabled')
          .eq('user_id', user.id)
          .single();
        
        if (data?.ev_interval_minutes) {
          setIntervalMinutes(data.ev_interval_minutes);
          
          // Carregar timer salvo do localStorage
          const savedTimerData = localStorage.getItem(`ev_timer_${user.id}`);
          if (savedTimerData) {
            try {
              const { startTime, interval } = JSON.parse(savedTimerData);
              const now = Date.now();
              const elapsedSeconds = Math.floor((now - startTime) / 1000);
              const totalSeconds = interval * 60;
              const remainingSeconds = totalSeconds - elapsedSeconds;
              
              if (remainingSeconds > 0) {
                setTimer(remainingSeconds);
              } else {
                // Timer já expirou, reiniciar
                setTimer(interval * 60);
                localStorage.removeItem(`ev_timer_${user.id}`);
              }
            } catch (error) {
              console.error('Erro ao carregar timer salvo:', error);
              setTimer(data.ev_interval_minutes * 60);
            }
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
        
        if (data?.tab_blink_enabled !== undefined) {
          setTabBlinkEnabled(data.tab_blink_enabled);
        }
      }
    };
    fetchUserPreferences();
  }, [user]);

  // Salvar timer no localStorage quando mudar
  useEffect(() => {
    if (user && timer > 0) {
      const timerData = {
        startTime: Date.now() - ((intervalMinutes * 60 - timer) * 1000),
        interval: intervalMinutes
      };
      localStorage.setItem(`ev_timer_${user.id}`, JSON.stringify(timerData));
    }
  }, [timer, user, intervalMinutes]);

  // Cronômetro regressivo
  useEffect(() => {
    if (!user) return;
    
    if (timer <= 0) {
      // Tocar som apenas se estiver habilitado
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.log('Erro ao tocar som:', e);
          // Se falhar por falta de interação, tentar novamente após um clique
          if (e.name === 'NotAllowedError') {
            const playOnClick = () => {
              audioRef.current.play().catch(() => {});
              document.removeEventListener('click', playOnClick);
            };
            document.addEventListener('click', playOnClick);
          }
        });
      }
      
      // Piscar aba se estiver habilitado
      if (tabBlinkEnabled) {
        startTabBlink();
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
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timer, intervalMinutes, user, soundEnabled]);

  // Listener para quando a aba voltar a ficar ativa
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Recalcular timer quando a aba voltar a ficar ativa
        const savedTimerData = localStorage.getItem(`ev_timer_${user.id}`);
        if (savedTimerData) {
          try {
            const { startTime, interval } = JSON.parse(savedTimerData);
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const totalSeconds = interval * 60;
            const remainingSeconds = totalSeconds - elapsedSeconds;
            
            if (remainingSeconds > 0) {
              setTimer(remainingSeconds);
            } else {
              // Timer já expirou, tocar som e reiniciar
              if (soundEnabled && audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.log('Erro ao tocar som:', e));
              }
              setShouldTriggerReminder(true);
              setTimer(interval * 60);
              localStorage.removeItem(`ev_timer_${user.id}`);
            }
          } catch (error) {
            console.error('Erro ao recalcular timer:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, soundEnabled]);

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

  const updateSoundEnabled = (enabled) => {
    setSoundEnabled(enabled);
  };

  const updateTabBlinkEnabled = (enabled) => {
    setTabBlinkEnabled(enabled);
  };

  // Função para piscar a aba do navegador
  const startTabBlink = () => {
    let blinkCount = 0;
    const maxBlinks = 10; // Piscar 10 vezes
    const originalTitle = document.title;
    
    const blinkInterval = setInterval(() => {
      if (blinkCount >= maxBlinks) {
        clearInterval(blinkInterval);
        document.title = originalTitle;
        return;
      }
      
      document.title = blinkCount % 2 === 0 ? '🔴 EV TEMPO!' : originalTitle;
      blinkCount++;
    }, 500); // Piscar a cada 500ms
  };

  return (
    <EVTimerContext.Provider value={{ 
      timer, 
      formatTime, 
      intervalMinutes, 
      shouldTriggerReminder, 
      consumeReminder,
      updateInterval,
      soundEnabled,
      updateSoundEnabled,
      tabBlinkEnabled,
      updateTabBlinkEnabled
    }}>
      <audio ref={audioRef} src="/sounds/reminder.mp3" preload="auto" />
      {children}
    </EVTimerContext.Provider>
  );
};

export const useEVTimer = () => useContext(EVTimerContext); 