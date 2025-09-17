import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import './BluetoothEVController.css';
import toast from 'react-hot-toast';

const BluetoothEVController = () => {
  const { user } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState('none');
  
  // Usar refs para valores que não devem causar re-renderização
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const clickTimeoutRef = useRef(null);
  
  // Configurações de tolerância
  const CLICK_TIMEOUT = 1000; // 1 segundo para aguardar mais cliques
  const MAX_CLICKS = 5; // Máximo 5 cliques (notas 0-4)

  // Função para lidar com mudanças de volume (usando refs)
  const handleVolumeChange = useCallback(() => {
    console.log('🔊 Tecla de volume detectada!');
    
    const now = Date.now();
    
    // Limpar timeout anterior se existir
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    // Incrementar contador
    const newCount = Math.min(clickCountRef.current + 1, MAX_CLICKS);
    clickCountRef.current = newCount;
    lastClickTimeRef.current = now;
    
    setClickCount(newCount);
    setLastClickTime(now);
    
    console.log(`🎯 Clique detectado! Contador: ${newCount}/${MAX_CLICKS}`);
    
    // Se atingiu o máximo, registra imediatamente
    if (newCount === MAX_CLICKS) {
      console.log('🎉 Máximo de cliques atingido! Registrando EV...');
      registerEV(newCount - 1); // -1 porque queremos notas 0-4, não 1-5
      resetClickCounter();
      return;
    }
    
    // Aguardar 1 segundo para mais cliques
    clickTimeoutRef.current = setTimeout(() => {
      console.log(`⏰ Timeout de ${CLICK_TIMEOUT}ms atingido. Registrando EV nível ${newCount - 1}...`);
      registerEV(newCount - 1);
      resetClickCounter();
    }, CLICK_TIMEOUT);
    
  }, []);

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

  // Detectar teclas de volume (método principal)
  useEffect(() => {
    if (!isListening) return;

    console.log('🎧 Iniciando detecção de teclas de volume...');

    // Detectar teclas de volume do controle Bluetooth/teclado
    const handleKeyPress = (event) => {
      console.log('⌨️ Tecla pressionada:', event.code, event.key);
      
      // SIMPLIFICADO: Se detectou qualquer tecla, processar
      console.log('🔊 Tecla detectada, processando...');
      handleVolumeChange();
    };

    // Detectar mudanças de volume do sistema (funciona globalmente)
    const handleVolumeChangeEvent = () => {
      console.log('🔊 Evento volumechange disparado');
      handleVolumeChange();
    };

    // Detectar mudanças de volume via MediaSession API (funciona globalmente)
    const handleMediaSessionVolumeChange = () => {
      console.log('🔊 MediaSession volume change detectado');
      handleVolumeChange();
    };

    // Adicionar event listeners
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('volumechange', handleVolumeChangeEvent);
    
    // MediaSession API para detecção global
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('previoustrack', handleMediaSessionVolumeChange);
      navigator.mediaSession.setActionHandler('nexttrack', handleMediaSessionVolumeChange);
      console.log('✅ MediaSession API configurada para detecção global');
    }
    
    setDetectionMethod('keyboard');
    console.log('✅ Detecção de teclas iniciada com sucesso!');

    return () => {
      console.log('⏹️ Parando detecção de teclas...');
      
      // Limpar timeout se existir
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      
      // Limpar event listeners
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('volumechange', handleVolumeChangeEvent);
      
      // Limpar MediaSession
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
      
      setDetectionMethod('none');
    };
  }, [isListening, handleVolumeChange]);

  // Funções auxiliares
  const resetClickCounter = useCallback(() => {
    // Limpar timeout se existir
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    clickCountRef.current = 0;
    lastClickTimeRef.current = 0;
    setClickCount(0);
    setLastClickTime(0);
  }, []);

  const startListening = useCallback(() => {
    console.log('🎧 Iniciando detecção...');
    setIsListening(true);
    resetClickCounter();
  }, [resetClickCounter]);

  const stopListening = useCallback(() => {
    console.log('⏹️ Parando detecção...');
    setIsListening(false);
    resetClickCounter();
  }, [resetClickCounter]);

  const simulateClick = useCallback(() => {
    console.log('🧪 Simulando clique...');
    handleVolumeChange(); // Usar a mesma lógica
  }, [handleVolumeChange]);

  const registerEV = useCallback(async (level) => {
    try {
      console.log('📝 Registrando EV nível:', level);
      
      // Usar Supabase diretamente
      const { data, error } = await supabase
        .from('evs')
        .insert([
          {
            user_id: user.id,
            score: level,
            notes: `EV via Botão Bluetooth - Nível ${level}`
          }
        ]);

      if (error) {
        console.error('❌ Erro ao registrar EV no Supabase:', error);
        toast.error('Erro ao registrar EV');
      } else {
        console.log('✅ EV nível', level, 'registrado com sucesso!');
        giveFeedback(level);
        toast.success(`EV nível ${level} registrado!`);
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast.error('Erro inesperado ao registrar EV');
    }
  }, [user?.id]);

  const giveFeedback = useCallback((level) => {
    // Vibração (se suportado)
    if (navigator.vibrate) {
      const pattern = [100, 50, 100, 50, 100];
      navigator.vibrate(pattern);
    }
    
    // Som de confirmação
    const audio = new Audio('/sounds/coin.mp3');
    audio.play().catch(e => {
      console.log('🔊 Erro ao tocar som:', e);
      
      // Se for NotAllowedError, aguardar interação do usuário
      if (e.name === 'NotAllowedError') {
        console.log('Som bloqueado pelo navegador. Aguardando interação do usuário...');
        
        const playOnInteraction = () => {
          audio.play().catch(() => {
            console.log('Ainda não foi possível tocar o som');
          });
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
      }
    });
  }, []);

  // Só renderiza se estiver habilitado nas configurações
  if (!isEnabled) {
    return null;
  }

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

      {/* Status da detecção */}
      {isListening && (
        <div className="detection-status">
          <p><strong>🔍 Método de detecção:</strong> {detectionMethod}</p>
          <p><strong>💡 Dica:</strong> Use as teclas de volume do seu controle Bluetooth</p>
          <p><strong>⏰ Lógica:</strong> Aguarda 1s após cada clique para mais cliques</p>
          <p><strong>⚠️ Nota:</strong> Funciona mesmo com a aba não focada</p>
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
        {clickCount > 0 && (
          <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            ⏰ Aguardando {CLICK_TIMEOUT/1000}s para mais cliques...
          </p>
        )}
      </div>

      <div className="instructions">
        <h4>📋 Como usar:</h4>
        <ul>
          <li><strong>1 clique + 1s:</strong> EV nível 0</li>
          <li><strong>2 cliques + 1s:</strong> EV nível 1</li>
          <li><strong>3 cliques + 1s:</strong> EV nível 2</li>
          <li><strong>4 cliques + 1s:</strong> EV nível 3</li>
          <li><strong>5 cliques:</strong> EV nível 4 (automático)</li>
        </ul>
        <p><strong>⏰ Tolerância:</strong> 1 segundo para aguardar mais cliques</p>
        <p><strong>🎮 Controles:</strong> Teclas de volume do controle Bluetooth</p>
        <p><strong>⚠️ Nota:</strong> Ative apenas quando quiser usar o botão Bluetooth</p>
      </div>
    </div>
  );
};

export default BluetoothEVController;
