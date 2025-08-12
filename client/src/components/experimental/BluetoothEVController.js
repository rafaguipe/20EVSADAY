import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDevAccess } from '../../hooks/useDevAccess';
import { isFeatureEnabled } from '../../utils/featureFlags';
import './BluetoothEVController.css';

const BluetoothEVController = () => {
  const { user } = useAuth();
  const hasDevAccess = useDevAccess();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  
  // Configurações de tolerância
  const CLICK_TIMEOUT = 1000; // 1 segundo entre cliques
  const MAX_CLICKS = 5; // Máximo 5 cliques (notas 0-4)

  // DEBUG: Log detalhado quando o componente renderiza
  useEffect(() => {
    console.log('🔍 BluetoothEVController DEBUG:', {
      component: 'BluetoothEVController',
      timestamp: new Date().toISOString(),
      user: user,
      username: user?.username,
      email: user?.email,
      hasDevAccess: hasDevAccess,
      featureEnabled: isFeatureEnabled('BLUETOOTH_EV_CONTROLLER', user?.username, hasDevAccess),
      localStorage: {
        supabaseToken: localStorage.getItem('supabase.auth.token') ? 'EXISTS' : 'NOT_FOUND',
        devMenuEnabled: localStorage.getItem('devMenuEnabled')
      }
    });
  }, [user, hasDevAccess]);

  // DEBUG: Verificar se o componente deve renderizar
  const shouldRender = hasDevAccess && isFeatureEnabled('BLUETOOTH_EV_CONTROLLER', user?.username, hasDevAccess);
  
  console.log('🎯 Render Decision:', {
    shouldRender: shouldRender,
    hasDevAccess: hasDevAccess,
    featureEnabled: isFeatureEnabled('BLUETOOTH_EV_CONTROLLER', user?.username, hasDevAccess),
    reason: !hasDevAccess ? 'No Dev Access' : 
            !isFeatureEnabled('BLUETOOTH_EV_CONTROLLER', user?.username, hasDevAccess) ? 'Feature Disabled' : 'All Good'
  });

  // Só renderiza se o usuário tem acesso ao Dev E a feature está habilitada
  if (!shouldRender) {
    console.log('❌ Componente NÃO renderizado:', {
      reason: !hasDevAccess ? 'Sem acesso Dev' : 'Feature desabilitada',
      user: user?.username,
      hasDevAccess: hasDevAccess
    });
    return null;
  }

  console.log('✅ Componente renderizado com sucesso!');

  // Detectar mudanças de volume
  useEffect(() => {
    if (!isListening) return;

    const handleVolumeChange = () => {
      // Tentar detectar mudança de volume (não é 100% confiável em todos os navegadores)
      console.log('🔊 Mudança de volume detectada');
      
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;
      
      // Se passou muito tempo, reinicia a contagem
      if (timeSinceLastClick > CLICK_TIMEOUT) {
        console.log('⏰ Tempo limite excedido, reiniciando contagem');
        setClickCount(1);
        setLastClickTime(now);
      } else {
        // Incrementa o contador
        const newCount = Math.min(clickCount + 1, MAX_CLICKS);
        console.log(`🎯 Clique detectado! Contador: ${newCount}`);
        setClickCount(newCount);
        setLastClickTime(now);
        
        // Se atingiu o máximo ou passou tempo, registra o EV
        if (newCount === MAX_CLICKS || timeSinceLastClick > CLICK_TIMEOUT) {
          registerEV(newCount - 1); // -1 porque queremos notas 0-4, não 1-5
          resetClickCounter();
        }
      }
    };

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
            
            if (Math.abs(average - currentVolume) > 10) { // Mudança significativa
              setCurrentVolume(average);
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
  }, [isListening, clickCount, lastClickTime, currentVolume]);

  const startListening = () => {
    console.log('🎧 Iniciando detecção de cliques...');
    setIsListening(true);
    setClickCount(0);
    setLastClickTime(0);
  };

  const stopListening = () => {
    console.log('⏹️ Parando detecção de cliques...');
    setIsListening(false);
    resetClickCounter();
  };

  const resetClickCounter = () => {
    setClickCount(0);
    setLastClickTime(0);
  };

  const simulateClick = () => {
    console.log('🧪 Simulando clique...');
    const now = Date.now();
    const newCount = Math.min(clickCount + 1, MAX_CLICKS);
    
    setClickCount(newCount);
    setLastClickTime(now);
    
    console.log(`🎯 Clique simulado! Contador: ${newCount}`);
    
    // Se atingiu o máximo, registra o EV
    if (newCount === MAX_CLICKS) {
      registerEV(newCount - 1);
      resetClickCounter();
    }
  };

  const registerEV = async (level) => {
    try {
      console.log('📝 Tentando registrar EV nível:', level);
      
      const response = await fetch('/api/evs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          score: level,
          notes: `EV via Botão Bluetooth - Nível ${level} [EXPERIMENTAL]`,
          source: 'bluetooth_button',
          experimental: true
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
    console.log('🎵 Dando feedback para nível:', level);
    
    // Vibração (se suportado)
    if (navigator.vibrate) {
      const pattern = [100, 50, 100, 50, 100];
      navigator.vibrate(pattern);
      console.log('📳 Vibração ativada');
    } else {
      console.log('📳 Vibração não suportada');
    }
    
    // Som de confirmação
    const audio = new Audio('/sounds/coin.mp3');
    audio.play().catch(e => console.log('🔊 Erro ao tocar som:', e));
  };

  return (
    <div className="bluetooth-ev-controller experimental-feature">
      <div className="experimental-badge">🧪 EXPERIMENTAL</div>
      
      <h3>🎮 Botão Bluetooth EV</h3>
      
      {/* DEBUG INFO */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <strong>🔍 DEBUG INFO:</strong><br/>
        Usuário: {user?.username || 'N/A'}<br/>
        Dev Access: {hasDevAccess ? '✅ SIM' : '❌ NÃO'}<br/>
        Feature Enabled: {isFeatureEnabled('BLUETOOTH_EV_CONTROLLER', user?.username, hasDevAccess) ? '✅ SIM' : '❌ NÃO'}<br/>
        Status: {isListening ? '🎧 OUVINDO' : '⏸️ PARADO'}<br/>
        Cliques: {clickCount}/{MAX_CLICKS}<br/>
        Timestamp: {new Date().toLocaleTimeString()}
      </div>
      
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
      </div>

      <div className="experimental-info">
        <p><strong>⚠️ Aviso:</strong> Esta é uma funcionalidade experimental.</p>
        <p>Use apenas para testes. Pode ser removida ou alterada.</p>
      </div>
    </div>
  );
};

export default BluetoothEVController;
