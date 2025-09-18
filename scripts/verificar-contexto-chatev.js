// Script para verificar especificamente o contexto de autenticação no ChatEV
// Execute este script no console do navegador na página /chat

console.log('🔍 VERIFICANDO CONTEXTO DE AUTENTICAÇÃO NO CHATEV');
console.log('==============================================');

const verificarContextoChatEV = async () => {
  try {
    // 1. Verificar se estamos na página correta
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      return;
    }
    console.log('✅ Está na página /chat');

    // 2. Verificar se há elementos de autenticação
    console.log('\n2️⃣ VERIFICANDO ELEMENTOS DE AUTENTICAÇÃO');
    
    // Procurar por elementos que indicam que o usuário está logado
    const authElements = document.querySelectorAll('[class*="User"], [class*="Profile"], [class*="Avatar"], [class*="Username"]');
    console.log('Elementos de autenticação na página:', authElements.length);
    
    if (authElements.length > 0) {
      console.log('✅ Elementos de autenticação encontrados');
      authElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 50));
      });
    } else {
      console.log('❌ Nenhum elemento de autenticação encontrado');
    }
    
    // Verificar se há navbar (indica que a página carregou)
    const navbar = document.querySelector('nav');
    console.log('Navbar encontrada:', navbar ? '✅' : '❌');
    
    if (navbar) {
      // Procurar por elementos de usuário na navbar
      const userElements = navbar.querySelectorAll('[class*="User"], [class*="Profile"], [class*="Avatar"], [class*="Username"]');
      console.log('Elementos de usuário na navbar:', userElements.length);
      
      if (userElements.length > 0) {
        console.log('✅ Usuário parece estar logado');
        userElements.forEach((el, i) => {
          console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 50));
        });
      } else {
        console.log('⚠️ Usuário pode não estar logado');
      }
    }

    // 3. Verificar se há elementos de login/logout
    console.log('\n3️⃣ VERIFICANDO ELEMENTOS DE LOGIN/LOGOUT');
    
    const loginElements = document.querySelectorAll('[class*="Login"], [class*="Logout"], [class*="Auth"]');
    console.log('Elementos de login/logout:', loginElements.length);
    
    if (loginElements.length > 0) {
      console.log('Elementos de login/logout encontrados:');
      loginElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 50));
      });
    }

    // 4. Verificar se há elementos específicos do ChatEV
    console.log('\n4️⃣ VERIFICANDO ELEMENTOS ESPECÍFICOS DO CHAT');
    
    // Procurar por elementos com classes específicas do ChatEV
    const chatElements = document.querySelectorAll('[class*="Chat"], [class*="Message"], [class*="Container"]');
    console.log('Elementos específicos do chat:', chatElements.length);
    
    if (chatElements.length > 0) {
      console.log('Elementos específicos encontrados:');
      chatElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 5. Verificar se há elementos de formulário
    console.log('\n5️⃣ VERIFICANDO ELEMENTOS DE FORMULÁRIO');
    
    const formElements = document.querySelectorAll('form, textarea, button');
    console.log('Elementos de formulário:', formElements.length);
    
    if (formElements.length > 0) {
      console.log('Elementos de formulário encontrados:');
      formElements.slice(0, 5).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 6. Verificar se há elementos de mensagem
    console.log('\n6️⃣ VERIFICANDO ELEMENTOS DE MENSAGEM');
    
    const messageElements = document.querySelectorAll('[class*="Message"], [class*="message"]');
    console.log('Elementos de mensagem:', messageElements.length);
    
    if (messageElements.length > 0) {
      console.log('Elementos de mensagem encontrados:');
      messageElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 7. Verificar se há elementos de container
    console.log('\n7️⃣ VERIFICANDO ELEMENTOS DE CONTAINER');
    
    const containerElements = document.querySelectorAll('[class*="Container"], [class*="container"]');
    console.log('Elementos de container:', containerElements.length);
    
    if (containerElements.length > 0) {
      console.log('Elementos de container encontrados:');
      containerElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 8. Verificar se há elementos de carregamento
    console.log('\n8️⃣ VERIFICANDO ELEMENTOS DE CARREGAMENTO');
    
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spinner"]');
    console.log('Elementos de carregamento:', loadingElements.length);
    
    if (loadingElements.length > 0) {
      console.log('⚠️ Página ainda pode estar carregando');
    }

    // 9. Verificar se há elementos de erro
    console.log('\n9️⃣ VERIFICANDO ELEMENTOS DE ERRO');
    
    const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], [class*="not-found"]');
    console.log('Elementos de erro:', errorElements.length);
    
    if (errorElements.length > 0) {
      console.log('❌ Elementos de erro encontrados:');
      errorElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    }

    // 10. Verificar se há elementos de toast/notificação
    console.log('\n10️⃣ VERIFICANDO ELEMENTOS DE TOAST/NOTIFICAÇÃO');
    
    const toastElements = document.querySelectorAll('[class*="toast"], [class*="Toast"], [class*="notification"]');
    console.log('Elementos de toast/notificação:', toastElements.length);
    
    if (toastElements.length > 0) {
      console.log('Elementos de toast encontrados:');
      toastElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    }

    // 11. Resumo final
    console.log('\n🎯 RESUMO FINAL');
    console.log('===============');
    
    if (authElements.length === 0 && loginElements.length === 0) {
      console.log('❌ PROBLEMA: Usuário pode não estar logado');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se o usuário está logado');
      console.log('2. Fazer login novamente');
      console.log('3. Verificar se há problemas de sessão');
    } else if (chatElements.length === 0 && formElements.length === 0) {
      console.log('❌ PROBLEMA: Componente ChatEV não está sendo renderizado');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há erros JavaScript no console');
      console.log('2. Recarregar a página (F5)');
      console.log('3. Verificar se o componente está sendo importado');
    } else if (formElements.length > 0 && messageElements.length === 0) {
      console.log('⚠️ PROBLEMA: Formulário está presente, mas mensagens não estão sendo exibidas');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há problemas de carregamento de mensagens');
      console.log('2. Verificar se há problemas de Realtime');
      console.log('3. Verificar se há problemas de permissão');
    } else {
      console.log('✅ Componente ChatEV está sendo renderizado');
      console.log('💡 Problema pode ser específico do envio de mensagens');
    }

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    console.log('Stack trace:', error.stack);
  }
};

// Executar diagnóstico
verificarContextoChatEV();
