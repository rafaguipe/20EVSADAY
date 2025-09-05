// Script para resetar o sistema de DMs e limpar cache
// Execute este script no console do navegador

console.log('🔄 Resetando sistema de DMs...');

// 1. Limpar localStorage relacionado a DMs
localStorage.removeItem('dm_critical_error');
localStorage.removeItem('dm_notifications_cache');
localStorage.removeItem('dm_unread_count');
localStorage.removeItem('dm_last_notification');

// 2. Limpar sessionStorage
sessionStorage.clear();

// 3. Limpar cache de badges também
localStorage.removeItem('badges_cache');
localStorage.removeItem('user_badges_cache');
localStorage.removeItem('user_stats_cache');

// 4. Forçar desconexão de todos os canais Realtime
if (window.supabase) {
  try {
    // Desconectar todos os canais
    window.supabase.removeAllChannels();
    console.log('✅ Canais Realtime desconectados');
  } catch (error) {
    console.log('⚠️ Erro ao desconectar canais:', error);
  }
}

// 5. Mostrar informações do sistema
console.log('📊 Status do sistema:');
console.log('- localStorage limpo:', Object.keys(localStorage).length === 0);
console.log('- sessionStorage limpo:', Object.keys(sessionStorage).length === 0);

// 6. Aguardar um pouco e recarregar
setTimeout(() => {
  console.log('🔄 Recarregando página...');
  window.location.reload(true);
}, 1000);

// Alternativa: apenas recarregar sem cache
// window.location.reload();
