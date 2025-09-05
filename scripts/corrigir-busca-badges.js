// Script para corrigir problemas de busca de badges com caracteres especiais
// Execute este script no console do navegador

console.log('🔧 Corrigindo busca de badges...');

// Função para buscar badge de forma segura
const buscarBadgeSegura = async (nomeBadge) => {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('id, name, description, icon')
      .eq('name', nomeBadge)
      .single();

    if (error) {
      console.error(`❌ Erro ao buscar badge "${nomeBadge}":`, error);
      
      // Tentar busca alternativa sem acentos
      const nomeSemAcentos = nomeBadge
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      console.log(`🔄 Tentando busca alternativa: "${nomeSemAcentos}"`);
      
      const { data: dataAlt, error: errorAlt } = await supabase
        .from('badges')
        .select('id, name, description, icon')
        .eq('name', nomeSemAcentos)
        .single();
      
      if (errorAlt) {
        console.error(`❌ Badge não encontrada: "${nomeBadge}"`);
        return null;
      }
      
      return dataAlt;
    }
    
    console.log(`✅ Badge encontrada: "${nomeBadge}"`);
    return data;
  } catch (error) {
    console.error(`❌ Erro geral ao buscar badge "${nomeBadge}":`, error);
    return null;
  }
};

// Testar busca das badges problemáticas
const testarBadges = async () => {
  console.log('🧪 Testando busca de badges...');
  
  const badgesParaTestar = [
    'Fundador',
    'Líder 4 Anos de Fundação',
    'first_ev',
    'persistente',
    'determinado'
  ];
  
  for (const badge of badgesParaTestar) {
    const resultado = await buscarBadgeSegura(badge);
    if (resultado) {
      console.log(`✅ ${badge}: ID ${resultado.id}`);
    } else {
      console.log(`❌ ${badge}: Não encontrada`);
    }
  }
};

// Executar teste
testarBadges();

// Função para limpar cache de badges
const limparCacheBadges = () => {
  console.log('🧹 Limpando cache de badges...');
  localStorage.removeItem('badges_cache');
  localStorage.removeItem('user_badges_cache');
  localStorage.removeItem('user_stats_cache');
  console.log('✅ Cache limpo');
};

// Executar limpeza
limparCacheBadges();

console.log('🎯 Script executado! Verifique os resultados acima.');
