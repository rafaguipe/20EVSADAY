// Configurações do sistema de Direct Messages
export const DM_CONFIG = {
  // Habilitar/desabilitar sistema de DMs
  ENABLED: true,
  
  // Máximo de erros antes de desabilitar automaticamente
  MAX_ERRORS: 3,
  
  // Timeout para conexões Realtime (ms)
  REALTIME_TIMEOUT: 10000,
  
  // Intervalo para reconexão em caso de erro (ms)
  RECONNECT_INTERVAL: 5000,
  
  // Máximo de tentativas de reconexão
  MAX_RECONNECT_ATTEMPTS: 3,
  
  // Habilitar logs detalhados (false em produção)
  DEBUG_MODE: false,
  
  // Habilitar fallback para notificações simples
  FALLBACK_NOTIFICATIONS: true,
  
  // Tempo de duração do toast (ms)
  TOAST_DURATION: 4000,
  
  // Habilitar controle de rate limiting
  RATE_LIMITING: true,
  
  // Máximo de notificações por minuto
  MAX_NOTIFICATIONS_PER_MINUTE: 10
};

// Função para verificar se o sistema está habilitado
export const isDMEnabled = () => {
  try {
    // Verificar se há algum erro crítico no localStorage
    const criticalError = localStorage.getItem('dm_critical_error');
    if (criticalError) {
      const errorTime = parseInt(criticalError);
      const now = Date.now();
      // Se o erro foi há mais de 1 hora, permitir reativação
      if (now - errorTime > 3600000) {
        localStorage.removeItem('dm_critical_error');
        return DM_CONFIG.ENABLED;
      }
      return false;
    }
    return DM_CONFIG.ENABLED;
  } catch (error) {
    console.error('Erro ao verificar status do sistema DM:', error);
    return false;
  }
};

// Função para marcar erro crítico
export const markCriticalError = () => {
  try {
    localStorage.setItem('dm_critical_error', Date.now().toString());
  } catch (error) {
    console.error('Erro ao marcar erro crítico:', error);
  }
};

// Função para limpar erro crítico
export const clearCriticalError = () => {
  try {
    localStorage.removeItem('dm_critical_error');
  } catch (error) {
    console.error('Erro ao limpar erro crítico:', error);
  }
};
