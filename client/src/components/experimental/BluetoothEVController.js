import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDevAccess } from '../../hooks/useDevAccess';
import { isFeatureEnabled } from '../../utils/featureFlags';
import './BluetoothEVController.css';

const BluetoothEVController = () => {
  const { user } = useAuth();
  const hasDevAccess = useDevAccess();
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [pressStartTime, setPressStartTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // Só renderiza se o usuário tem acesso ao Dev E a feature está habilitada
  if (!hasDevAccess || !isFeatureEnabled('BLUETOOTH_EV_CONTROLLER', user?.username, hasDevAccess)) {
    return null;
  }

  const connectToDevice = async () => {
    try {
      // Verificar se Web Bluetooth API está disponível
      if (!navigator.bluetooth) {
        alert('Web Bluetooth não é suportado neste navegador. Use Chrome ou Edge.');
        return;
      }

      // Solicitar dispositivo Bluetooth
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Kaliou' }, // Nome do seu controle
          { namePrefix: 'BT' },     // Fallback genérico
          { namePrefix: 'Remote' }  // Fallback genérico
        ],
        optionalServices: ['generic_access', 'device_information']
      });

      setDevice(bluetoothDevice);
      setIsConnected(true);
      
      // Configurar listeners para o dispositivo
      setupDeviceListeners(bluetoothDevice);
      
      console.log('Conectado ao controle Bluetooth!');
    } catch (error) {
      console.error('Erro na conexão Bluetooth:', error);
      alert('Erro ao conectar: ' + error.message);
    }
  };

  const setupDeviceListeners = (bluetoothDevice) => {
    // Listener para quando o dispositivo se desconecta
    bluetoothDevice.addEventListener('gattserverdisconnected', () => {
      setIsConnected(false);
      setDevice(null);
      console.log('Dispositivo desconectado');
    });
  };

  const simulateButtonPress = () => {
    // Simulação para teste (remove quando tiver o controle real)
    setPressStartTime(Date.now());
    setIsRecording(true);
    
    // Simular diferentes durações para teste
    setTimeout(() => {
      handleButtonRelease(1000); // 1 segundo
    }, 1000);
  };

  const handleButtonPress = () => {
    setPressStartTime(Date.now());
    setIsRecording(true);
  };

  const handleButtonRelease = (duration) => {
    setIsRecording(false);
    const pressDuration = duration || (Date.now() - pressStartTime);
    const level = calculateEVLevel(pressDuration);
    
    registerEV(level);
    giveFeedback(level);
  };

  const calculateEVLevel = (duration) => {
    if (duration < 1000) return 0;      // < 1s
    if (duration < 2000) return 1;      // 1-2s
    if (duration < 3000) return 2;      // 2-3s
    if (duration < 4000) return 3;      // 3-4s
    return 4;                           // > 4s
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
          notes: `EV via Bluetooth - Nível ${level} [EXPERIMENTAL]`,
          source: 'bluetooth_controller',
          experimental: true
        })
      });

      if (response.ok) {
        console.log(`EV nível ${level} registrado com sucesso!`);
      } else {
        console.error('Erro ao registrar EV');
      }
    } catch (error) {
      console.error('Erro na API:', error);
    }
  };

  const giveFeedback = (level) => {
    // Vibração (se suportado)
    if (navigator.vibrate) {
      const pattern = [100, 50, 100, 50, 100];
      navigator.vibrate(pattern);
    }
    
    // Som de confirmação
    const audio = new Audio('/sounds/coin.mp3'); // Usar som existente
    audio.play().catch(e => console.log('Erro ao tocar som:', e));
  };

  const disconnect = () => {
    if (device && device.gatt && device.gatt.connected) {
      device.gatt.disconnect();
    }
    setIsConnected(false);
    setDevice(null);
  };

  return (
    <div className="bluetooth-ev-controller experimental-feature">
      <div className="experimental-badge">🧪 EXPERIMENTAL</div>
      
      <h3>🎮 Controle Bluetooth EV</h3>
      
      {!isConnected ? (
        <button 
          onClick={connectToDevice}
          className="btn-connect-bluetooth"
        >
          🔵 Conectar Controle
        </button>
      ) : (
        <div className="connected-status">
          <div className="status-indicator connected">
            🔵 Conectado
          </div>
          
          <button onClick={disconnect} className="btn-disconnect">
            ❌ Desconectar
          </button>
        </div>
      )}

      {/* Simulação para teste */}
      {!isConnected && (
        <div className="test-mode">
          <h4>🧪 Modo Teste (sem controle real)</h4>
          <button 
            onClick={simulateButtonPress}
            className="btn-test-press"
            disabled={isRecording}
          >
            {isRecording ? '⏱️ Gravando...' : '🎯 Simular Pressionamento'}
          </button>
        </div>
      )}

      <div className="instructions">
        <h4>📋 Como usar:</h4>
        <ul>
          <li><strong>Pressionamento rápido:</strong> EV nível 0</li>
          <li><strong>Segurar 1-2s:</strong> EV nível 1</li>
          <li><strong>Segurar 2-3s:</strong> EV nível 2</li>
          <li><strong>Segurar 3-4s:</strong> EV nível 3</li>
          <li><strong>Segurar 4-5s:</strong> EV nível 4</li>
        </ul>
      </div>

      <div className="experimental-info">
        <p><strong>⚠️ Aviso:</strong> Esta é uma funcionalidade experimental.</p>
        <p>Use apenas para testes. Pode ser removida ou alterada.</p>
      </div>
    </div>
  );
};

export default BluetoothEVController;
