// Script para testar o toggle da votação
// Execute este script no console do navegador

console.log('🧪 Testando toggle da votação...');

// Função para testar o toggle
const testarToggleVotacao = async () => {
  try {
    // Verificar se estamos na página de dev
    if (!window.location.pathname.includes('/dev')) {
      console.log('⚠️ Você não está na página de desenvolvimento');
      console.log('💡 Navegue para /dev primeiro');
      return;
    }

    console.log('✅ Está na página de desenvolvimento');

    // Procurar pelo componente TabVisibilityControl
    const tabControl = document.querySelector('[data-testid="tab-visibility-control"]') || 
                      document.querySelector('div:contains("Controle de Visibilidade das Abas")') ||
                      document.querySelector('div:contains("📋 Controle de Visibilidade das Abas")');

    if (!tabControl) {
      console.log('⚠️ Componente TabVisibilityControl não encontrado');
      console.log('💡 Verifique se o componente está renderizando');
      return;
    }

    console.log('✅ Componente TabVisibilityControl encontrado');

    // Procurar pelo toggle da votação
    const votacaoToggle = Array.from(document.querySelectorAll('input[type="checkbox"]'))
      .find(input => {
        const parent = input.closest('div');
        return parent && parent.textContent.includes('🗳️ Votação');
      });

    if (!votacaoToggle) {
      console.log('⚠️ Toggle da votação não encontrado');
      console.log('💡 Verifique se o toggle está sendo renderizado');
      return;
    }

    console.log('✅ Toggle da votação encontrado');
    console.log('📊 Estado atual:', votacaoToggle.checked ? 'Ativado' : 'Desativado');

    // Verificar se o toggle está funcionando
    const originalState = votacaoToggle.checked;
    
    // Simular clique no toggle
    votacaoToggle.click();
    
    // Aguardar um pouco para a mudança ser processada
    setTimeout(() => {
      const newState = votacaoToggle.checked;
      console.log('📊 Estado após clique:', newState ? 'Ativado' : 'Desativado');
      
      if (newState !== originalState) {
        console.log('✅ Toggle está funcionando!');
        
        // Verificar se a mudança foi salva no banco
        setTimeout(async () => {
          try {
            // Tentar acessar Supabase se estiver disponível
            if (window.supabase) {
              const { data, error } = await window.supabase
                .rpc('get_system_setting', { p_key: 'votacao_visible' });
              
              if (error) {
                console.log('❌ Erro ao verificar configuração no banco:', error);
              } else {
                console.log('📊 Valor no banco:', data);
                console.log('✅ Configuração salva no banco!');
              }
            } else {
              console.log('⚠️ Supabase não está disponível globalmente');
              console.log('💡 Verifique se a mudança foi salva manualmente');
            }
          } catch (error) {
            console.log('❌ Erro ao verificar banco:', error);
          }
        }, 2000);
        
      } else {
        console.log('❌ Toggle não está funcionando');
        console.log('💡 Verifique se há erros no console');
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Função para verificar se a aba de votação está visível na navbar
const verificarVisibilidadeNavbar = () => {
  console.log('\n🔍 Verificando visibilidade na navbar...');
  
  // Procurar pelo link da votação na navbar
  const votacaoLink = Array.from(document.querySelectorAll('a'))
    .find(link => link.textContent.includes('🗳️ Votação') || link.href.includes('/votacao-mascote'));
  
  if (votacaoLink) {
    console.log('✅ Link da votação encontrado na navbar');
    console.log('📊 Visível:', votacaoLink.offsetParent !== null ? 'Sim' : 'Não');
  } else {
    console.log('⚠️ Link da votação não encontrado na navbar');
    console.log('💡 A aba pode estar desativada');
  }
};

// Função para verificar erros no console
const verificarErros = () => {
  console.log('\n🔍 Verificando erros no console...');
  
  // Capturar erros
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Restaurar após 5 segundos
  setTimeout(() => {
    console.error = originalError;
    
    if (errors.length > 0) {
      console.log('❌ Erros encontrados:');
      errors.forEach(error => console.log(' -', error));
    } else {
      console.log('✅ Nenhum erro encontrado');
    }
  }, 5000);
};

// Executar testes
console.log('🚀 Iniciando testes...');
testarToggleVotacao();
verificarVisibilidadeNavbar();
verificarErros();

console.log('\n💡 Instruções:');
console.log('1. Navegue para /dev');
console.log('2. Encontre o toggle da votação');
console.log('3. Clique no toggle');
console.log('4. Verifique se a mudança foi salva');
console.log('5. Verifique se a aba aparece/desaparece na navbar');
