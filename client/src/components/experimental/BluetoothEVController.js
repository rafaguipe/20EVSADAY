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
  const [audioDetectionEnabled, setAudioDetectionEnabled] = useState(true);
  
  // Usar refs para valores que não devem causar re-renderização
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const currentVolumeRef = useRef(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);
  const audioBaselineRef = useRef(0);
  const consecutiveDetectionsRef = useRef(0);
  
  // Configurações de tolerância
  const CLICK_TIMEOUT = 1000; // 1 segundo entre cliques
  const MAX_CLICKS = 5; // Máximo 5 cliques (notas 0-4)
  const AUDIO_THRESHOLD = 50; // Threshold muito mais alto para reduzir falsos positivos
  const DEBOUNCE_TIME = 500; // 500ms entre detecções
  const CONSECUTIVE_THRESHOLD = 3; // Precisa de 3 detecções consecutivas para confirmar

  // Função para lidar com mudanças de volume (usando refs)
  const handleVolumeChange = useCallback(() => {
    console.log('🔊 Mudança de volume detectada!');
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    
    // Se passou muito tempo, reinicia a contagem
    if (timeSinceLastClick > CLICK_TIMEOUT) {
      clickCountRef.current = 1;
      lastClickTimeRef.current = now;
      setClickCount(1);
      setLastClickTime(now);
      console.log('🔄 Reiniciando contagem: 1 clique');
    } else {
      // Incrementa o contador
      const newCount = Math.min(clickCountRef.current + 1, MAX_CLICKS);
      clickCountRef.current = newCount;
      lastClickTimeRef.current = now;
      
      setClickCount(newCount);
      setLastClickTime(now);
      
      console.log(`🎯 Clique detectado! Contador: ${newCount}/${MAX_CLICKS}`);
      
      // Se atingiu o máximo ou passou tempo, registra o EV
      if (newCount === MAX_CLICKS) {
        console.log('🎉 Máximo de cliques atingido! Registrando EV...');
        registerEV(newCount - 1); // -1 porque queremos notas 0-4, não 1-5
        resetClickCounter();
      }
    }
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

  // Detectar mudanças de volume com múltiplos métodos
  useEffect(() => {
    if (!isListening) return;

    console.log('🎧 Iniciando detecção de volume...');

    // Método 1: Evento volumechange (funciona com teclas de volume)
    const handleVolumeChangeEvent = () => {
      console.log('🔊 Evento volumechange disparado');
      handleVolumeChange();
    };

    // Método 2: Teclas de volume do teclado
    const handleKeyPress = (event) => {
      if (event.code === 'AudioVolumeUp' || event.code === 'AudioVolumeDown') {
        console.log('⌨️ Tecla de volume pressionada:', event.code);
        handleVolumeChange();
      }
    };

    // Método 3: Detecção de áudio via Web Audio API
    const startAudioDetection = async () => {
      try {
        console.log('🎵 Iniciando detecção de áudio...');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        });
        
        mediaStreamRef.current = stream;
        
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        
        analyser.fftSize = 256;
        source.connect(analyser);
        
        setDetectionMethod('audio');
        console.log('✅ Detecção de áudio iniciada com sucesso!');
        
                 // Monitorar mudanças de áudio
         const checkAudioLevel = () => {
           if (!isListening || !analyserRef.current || !audioDetectionEnabled) return;
           
           const dataArray = new Uint8Array(analyser.frequencyBinCount);
           analyserRef.current.getByteFrequencyData(dataArray);
           
           const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
           
           // Estabelecer baseline na primeira execução
           if (audioBaselineRef.current === 0) {
             audioBaselineRef.current = average;
             currentVolumeRef.current = average;
             return;
           }
           
           // Calcular mudança relativa ao baseline
           const changeFromBaseline = Math.abs(average - audioBaselineRef.current);
           const changeFromCurrent = Math.abs(average - currentVolumeRef.current);
           
           // Só detectar se a mudança for muito significativa
           if (changeFromBaseline > AUDIO_THRESHOLD && changeFromCurrent > AUDIO_THRESHOLD / 2) {
             const now = Date.now();
             
             // Debounce mais longo para evitar falsos positivos
             if (now - lastDetectionTimeRef.current > DEBOUNCE_TIME) {
               console.log('🎵 Mudança significativa detectada:', {
                 average,
                 baseline: audioBaselineRef.current,
                 changeFromBaseline,
                 changeFromCurrent
               });
               
               // Incrementar contador de detecções consecutivas
               consecutiveDetectionsRef.current++;
               
               // Só confirmar se houver múltiplas detecções consecutivas
               if (consecutiveDetectionsRef.current >= CONSECUTIVE_THRESHOLD) {
                 console.log('✅ Detecção confirmada após', CONSECUTIVE_THRESHOLD, 'leituras consecutivas');
                 currentVolumeRef.current = average;
                 lastDetectionTimeRef.current = now;
                 consecutiveDetectionsRef.current = 0; // Reset contador
                 handleVolumeChange();
               }
             }
           } else {
             // Reset contador se não houver mudança significativa
             consecutiveDetectionsRef.current = 0;
           }
           
           // Continuar monitorando
           if (isListening) {
             requestAnimationFrame(checkAudioLevel);
           }
         };
        
        checkAudioLevel();
        
      } catch (err) {
        console.log('❌ Erro ao iniciar detecção de áudio:', err);
        setDetectionMethod('keyboard');
        
        // Fallback: apenas teclas de volume
        console.log('🔄 Usando detecção por teclas de volume');
      }
    };

    // Iniciar detecção
    startAudioDetection();

    // Adicionar event listeners
    window.addEventListener('volumechange', handleVolumeChangeEvent);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      console.log('⏹️ Parando detecção de volume...');
      
      // Limpar event listeners
      window.removeEventListener('volumechange', handleVolumeChangeEvent);
      window.removeEventListener('keydown', handleKeyPress);
      
      // Limpar recursos de áudio
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      analyserRef.current = null;
      setDetectionMethod('none');
    };
  }, [isListening, handleVolumeChange]);

  // Funções auxiliares
  const resetClickCounter = useCallback(() => {
    clickCountRef.current = 0;
    lastClickTimeRef.current = 0;
    consecutiveDetectionsRef.current = 0;
    audioBaselineRef.current = 0;
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
  }, [clickCount, resetClickCounter]);

  const registerEV = useCallback(async (level) => {
    try {
      console.log('📝 Registrando EV nível:', level);
      
      // Usar Supabase diretamente em vez da API inexistente
      const { data, error } = await supabase
        .from('evs')
        .insert([
          {
            user_id: user.id,
            score: level,
            notes: `EV via Botão Bluetooth - Nível ${level}`,
            source: 'bluetooth_button'
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
    audio.play().catch(e => console.log('🔊 Erro ao tocar som:', e));
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
          <p><strong>💡 Dica:</strong> Use as teclas de volume do seu controle ou teclado</p>
          
          {/* Toggle para detecção de áudio */}
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={audioDetectionEnabled}
                onChange={(e) => setAudioDetectionEnabled(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span><strong>🎵 Detecção de áudio</strong></span>
            </label>
            <p style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>
              {audioDetectionEnabled ? 
                '✅ Ativada (pode detectar cliques do controle)' : 
                '❌ Desativada (apenas teclas de volume)'
              }
            </p>
          </div>
          
          <p><strong>⚠️ Nota:</strong> Se houver muitos cliques fantasma, desative a detecção de áudio</p>
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
        <p><strong>🎮 Controles:</strong> Teclas de volume do controle Bluetooth ou teclado</p>
        <p><strong>⚠️ Nota:</strong> Ative apenas quando quiser usar o botão Bluetooth</p>
      </div>
    </div>
  );
};

export default BluetoothEVController;
