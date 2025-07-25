// Teste para verificar funcionalidade de notificação do chat
console.log('🧪 Testando notificações do chat...');

// Teste 1: Verificar se localStorage está funcionando
const testUserId = 'test-user-123';
const testTimestamp = new Date().toISOString();
const storageKey = `chat_last_read_${testUserId}`;

try {
  localStorage.setItem(storageKey, testTimestamp);
  const retrieved = localStorage.getItem(storageKey);
  console.log('✅ localStorage funcionando:', retrieved === testTimestamp);
  localStorage.removeItem(storageKey);
} catch (error) {
  console.log('❌ Erro no localStorage:', error);
}

// Teste 2: Verificar se o contexto está disponível
if (typeof window !== 'undefined') {
  console.log('✅ Executando no browser');
} else {
  console.log('❌ Não está no browser');
}

// Teste 3: Simular contagem de mensagens não lidas
const mockUnreadCount = 3;
console.log(`📊 Mensagens não lidas simuladas: ${mockUnreadCount}`);

console.log('🎯 Teste de notificação do chat concluído!'); 