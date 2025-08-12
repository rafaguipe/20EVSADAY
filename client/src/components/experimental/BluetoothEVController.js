import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import './BluetoothEVController.css';

const BluetoothEVController = () => {
  const { user } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Usar refs para valores que não devem causar re-renderização
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const currentVolumeRef = useRef(0);
  
  // Configurações de tolerância
  const CLICK_TIMEOUT = 1000; // 1 segundo entre cliques
  const MAX_CLICKS = 5; // Máximo 5 cliques (notas 0-4)

  // Verificar se o recurso está habilitado nas configurações
  useEffect(() => {
    const checkBluetoothEVEnabled = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('bluetooth_ev_enabled')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setIsEnabled(data.bluetooth_ev_enabled || false);
        }
      } catch (err) {
        console.log('Erro ao verificar configuração Bluetooth EV:', err);
        setIsEnabled(false);
      }
    };

    checkBluetoothEVEnabled();
  }, [user]);

  // Só renderiza se estiver habilitado nas configurações
  if (!isEnabled) {
    return null;
  }

  // Função para lidar com mudanças de volume (usando refs)
  const handleVolumeChange = useCallback(() => {
    console.log('🔊 Mudança de volume detectada');
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    
    // Se passou muito tempo, reinicia a contagem
    if (timeSinceLastClick > CLICK_TIMEOUT) {
      clickCountRef.current = 1;
      lastClickTimeRef.current = now;
      setClickCount(1);
      setLastClickTime(now);
    } else {
      // Incrementa o contador
      const newCount = Math.min(clickCountRef.current + 1, MAX_CLICKS);
      clickCountRef.current = newCount;
      lastClickTimeRef.current = now;
      
      setClickCount(newCount);
      setLastClickTime(now);
      
      // Se atingiu o máximo ou passou tempo, registra o EV
      if (newCount === MAX_CLICKS || timeSinceLastClick > CLICK_TIMEOUT) {
        registerEV(newCount - 1); // -1 porque queremos notas 0-4, não 1-5
        resetClickCounter();
      }
    }
  }, []);

  // Detectar mudanças de volume
  useEffect(() => {
    if (!isListening) return;

    // Adicionar listener para mudanças de volume
    window.addEventListener('volumechange', handleVolumeChange);
    
    // Fallback: detectar mudanças de volume via setInterval
    const volumeCheckInterval = setInterval(() => {
      // Tentar detectar mudanças de volume (método alternativo)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            
            if (Math.abs(average - currentVolumeRef.current) > 10) { // Mudança significativa
              currentVolumeRef.current = average;
              handleVolumeChange();
            }
          })
          .catch(err => console.log('🔊 Erro ao acessar áudio:', err));
      }
    }, 100);

    return () => {
      window.removeEventListener('volumechange', handleVolumeChange);
      clearInterval(volumeCheckInterval);
    };
  }, [isListening, handleVolumeChange]);

  const startListening = () => {
    setIsListening(true);
    resetClickCounter();
  };

  const stopListening = () => {
    setIsListening(false);
    resetClickCounter();
  };

  const resetClickCounter = () => {
    clickCountRef.current = 0;
    lastClickTimeRef.current = 0;
    setClickCount(0);
    setLastClickTime(0);
  };

  const simulateClick = () => {
    const now = Date.now();
    const newCount = Math.min(clickCount + 1, MAX_CLICKS);
    
    clickCountRef.current = newCount;
    lastClickTimeRef.current = now;
    setClickCount(newCount);
    setLastClickTime(now);
    
    // Se atingiu o máximo, registra o EV
    if (newCount === MAX_CLICKS) {
      registerEV(newCount - 1);
      resetClickCounter();
    }
  };

  const registerEV = async (level) => {
    try {
      const response = await fetch('/api/evs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          score: level,
          notes: `EV via Botão Bluetooth - Nível ${level}`,
          source: 'bluetooth_button'
        })
      });

      if (response.ok) {
        console.log('✅ EV nível', level, 'registrado com sucesso!');
        giveFeedback(level);
      } else {
        console.error('❌ Erro ao registrar EV:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erro na API:', error);
    }
  };

  const giveFeedback = (level) => {
    // Vibração (se suportado)
    if (navigator.vibrate) {
      const pattern = [100, 50, 100, 50, 100];
      navigator.vibrate(pattern);
    }
    
    // Som de confirmação
    const audio = new Audio('/sounds/coin.mp3');
    audio.play().catch(e => console.log('🔊 Erro ao tocar som:', e));
  };

  return (
    <div className="bluetooth-ev-controller">
      <h3>🎮 Botão Bluetooth EV</h3>
      
      {!isListening ? (
        <button 
          onClick={startListening}
          className="btn-connect-bluetooth"
        >
          🎧 Iniciar Detecção
        </button>
      ) : (
        <div className="connected-status">
          <div className="status-indicator connected">
            🎧 OUVINDO - Cliques: {clickCount}/{MAX_CLICKS}
          </div>
          
          <button onClick={stopListening} className="btn-disconnect">
            ⏹️ Parar Detecção
          </button>
        </div>
      )}

      {/* Simulação para teste */}
      <div className="test-mode">
        <h4>🧪 Modo Teste (simular cliques)</h4>
        <button 
          onClick={simulateClick}
          className="btn-test-press"
          disabled={!isListening}
        >
          🎯 Simular Clique
        </button>
        <p>Cliques atuais: {clickCount}/{MAX_CLICKS}</p>
      </div>

      <div className="instructions">
        <h4>📋 Como usar:</h4>
        <ul>
          <li><strong>1 clique:</strong> EV nível 0</li>
          <li><strong>2 cliques:</strong> EV nível 1</li>
          <li><strong>3 cliques:</strong> EV nível 2</li>
          <li><strong>4 cliques:</strong> EV nível 3</li>
          <li><strong>5 cliques:</strong> EV nível 4</li>
        </ul>
        <p><strong>⏰ Tolerância:</strong> 1 segundo entre cliques</p>
        <p><strong>⚠️ Nota:</strong> Ative apenas quando quiser usar o botão Bluetooth</p>
      </div>
    </div>
  );
};

export default BluetoothEVController;
