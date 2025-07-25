// Teste para verificar funcionalidade offline
console.log('🧪 Testando funcionalidade offline...');

// Teste 1: Verificar se localStorage está disponível
if (typeof localStorage !== 'undefined') {
  console.log('✅ localStorage disponível');
} else {
  console.log('❌ localStorage não disponível');
}

// Teste 2: Verificar status online/offline
console.log('🌐 Status da conexão:', navigator.onLine ? 'Online' : 'Offline');

// Teste 3: Simular dados offline
const testEV = {
  id: `test_${Date.now()}`,
  intensity: 7,
  comment: 'Teste offline',
  timestamp: new Date().toISOString(),
  synced: false
};

try {
  localStorage.setItem('evs_pending', JSON.stringify([testEV]));
  console.log('✅ Dados de teste salvos no localStorage');
  
  const loaded = JSON.parse(localStorage.getItem('evs_pending'));
  console.log('📊 EVs pendentes:', loaded.length);
  
  // Limpar dados de teste
  localStorage.removeItem('evs_pending');
  console.log('🧹 Dados de teste removidos');
} catch (error) {
  console.log('❌ Erro ao testar localStorage:', error);
}

console.log('🎯 Teste concluído!'); 