// Script para verificar e corrigir problemas de autenticação
// Execute este script no console do navegador na página /chat

console.log('🔧 VERIFICANDO E CORRIGINDO AUTENTICAÇÃO');
console.log('======================================');

const verificarECorrigirAuth = async () => {
  try {
    // 1. Verificar se estamos na página correta
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      return;
    }
    console.log('✅ Está na página /chat');

    // 2. Verificar se há elementos de login na navbar
    console.log('\n2️⃣ VERIFICANDO ELEMENTOS DE LOGIN');
    
    const navbar = document.querySelector('nav');
    if (!navbar) {
      console.log('❌ Navbar não encontrada');
      return;
    }
    
    // Procurar por botões de login/logout
    const loginButtons = navbar.querySelectorAll('a[href*="login"], a[href*="register"]');
    const logoutButtons = navbar.querySelectorAll('button:contains("Sair"), button:contains("Logout")');
    
    console.log('Botões de login encontrados:', loginButtons.length);
    console.log('Botões de logout encontrados:', logoutButtons.length);
    
    if (loginButtons.length > 0) {
      console.log('❌ Usuário não está logado - botões de login presentes');
      console.log('💡 SOLUÇÃO: Faça login primeiro');
      
      // Mostrar links de login
      loginButtons.forEach((btn, i) => {
        console.log(`${i + 1}. Link de login:`, btn.href, btn.textContent?.trim());
      });
      
      return;
    }
    
    if (logoutButtons.length > 0) {
      console.log('✅ Usuário está logado - botão de logout presente');
    }

    // 3. Verificar se há elementos de usuário na navbar
    console.log('\n3️⃣ VERIFICANDO ELEMENTOS DE USUÁRIO');
    
    // Procurar por elementos que indicam usuário logado
    const userElements = navbar.querySelectorAll('[class*="User"], [class*="Profile"], [class*="Avatar"], [class*="Username"]');
    console.log('Elementos de usuário na navbar:', userElements.length);
    
    if (userElements.length > 0) {
      console.log('✅ Elementos de usuário encontrados');
      userElements.forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 50));
      });
    } else {
      console.log('❌ Nenhum elemento de usuário encontrado');
    }

    // 4. Verificar se há elementos de autenticação em outras partes da página
    console.log('\n4️⃣ VERIFICANDO ELEMENTOS DE AUTENTICAÇÃO GERAIS');
    
    const authElements = document.querySelectorAll('[class*="User"], [class*="Profile"], [class*="Avatar"], [class*="Username"]');
    console.log('Elementos de autenticação na página:', authElements.length);
    
    if (authElements.length > 0) {
      console.log('Elementos de autenticação encontrados:');
      authElements.slice(0, 5).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 50));
      });
    }

    // 5. Verificar se há elementos de erro de autenticação
    console.log('\n5️⃣ VERIFICANDO ERROS DE AUTENTICAÇÃO');
    
    const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], [class*="not-found"]');
    console.log('Elementos de erro:', errorElements.length);
    
    if (errorElements.length > 0) {
      console.log('Elementos de erro encontrados:');
      errorElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    }

    // 6. Verificar se há elementos de carregamento
    console.log('\n6️⃣ VERIFICANDO ELEMENTOS DE CARREGAMENTO');
    
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spinner"]');
    console.log('Elementos de carregamento:', loadingElements.length);
    
    if (loadingElements.length > 0) {
      console.log('⚠️ Página ainda pode estar carregando');
    }

    // 7. Verificar se há elementos específicos do ChatEV
    console.log('\n7️⃣ VERIFICANDO ELEMENTOS ESPECÍFICOS DO CHAT');
    
    const chatElements = document.querySelectorAll('[class*="Chat"], [class*="Message"], [class*="Container"]');
    console.log('Elementos específicos do chat:', chatElements.length);
    
    if (chatElements.length > 0) {
      console.log('Elementos específicos encontrados:');
      chatElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 8. Verificar se há elementos de formulário
    console.log('\n8️⃣ VERIFICANDO ELEMENTOS DE FORMULÁRIO');
    
    const formElements = document.querySelectorAll('form, textarea, button');
    console.log('Elementos de formulário:', formElements.length);
    
    if (formElements.length > 0) {
      console.log('Elementos de formulário encontrados:');
      formElements.slice(0, 5).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 9. Resumo final e soluções
    console.log('\n🎯 RESUMO FINAL E SOLUÇÕES');
    console.log('==========================');
    
    if (loginButtons.length > 0) {
      console.log('❌ PROBLEMA: Usuário não está logado');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Clique em um dos links de login acima');
      console.log('2. Faça login com suas credenciais');
      console.log('3. Volte para a página /chat após o login');
      console.log('4. O chat público deve funcionar após o login');
    } else if (userElements.length === 0 && authElements.length === 0) {
      console.log('❌ PROBLEMA: Usuário pode não estar logado corretamente');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Recarregar a página (F5)');
      console.log('2. Fazer logout e login novamente');
      console.log('3. Verificar se há problemas de sessão');
      console.log('4. Verificar se há problemas de cookies');
    } else if (formElements.length > 0 && chatElements.length === 0) {
      console.log('⚠️ PROBLEMA: Formulário presente, mas chat não está funcionando');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há erros JavaScript no console');
      console.log('2. Recarregar a página (F5)');
      console.log('3. Verificar se há problemas de conexão');
      console.log('4. Verificar se há problemas de permissão');
    } else {
      console.log('✅ Usuário está logado e chat deve estar funcionando');
      console.log('💡 Se ainda não funciona, verifique:');
      console.log('1. Erros JavaScript no console');
      console.log('2. Conexão com Supabase');
      console.log('3. Permissões da tabela');
    }

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    console.log('Stack trace:', error.stack);
  }
};

// Executar diagnóstico
verificarECorrigirAuth();
