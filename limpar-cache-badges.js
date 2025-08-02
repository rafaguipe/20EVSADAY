// Script para limpar cache e forçar recarga das badges
// Execute este script no console do navegador

console.log('🧹 Limpando cache das badges...');

// Limpar localStorage relacionado a badges
localStorage.removeItem('badges_cache');
localStorage.removeItem('user_badges_cache');
localStorage.removeItem('user_stats_cache');

// Limpar sessionStorage
sessionStorage.clear();

// Forçar recarga da página
console.log('🔄 Recarregando página...');
window.location.reload(true);

// Alternativa: apenas recarregar sem cache
// window.location.reload(); 