// Script para verificar especificamente o problema de autenticação no ChatEV
// Execute este script no console do navegador na página /chat

console.log('🔍 VERIFICANDO AUTENTICAÇÃO NO CHATEV');
console.log('===================================');

const verificarAuthChatEV = async () => {
  try {
    // 1. Verificar se estamos na página correta
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      return;
    }
    console.log('✅ Está na página /chat');

    // 2. Verificar se há elementos React
    console.log('\n2️⃣ VERIFICANDO ELEMENTOS REACT');
    
    // Procurar por elementos com data-reactroot
    const reactRoot = document.querySelector('[data-reactroot]');
    console.log('React root encontrado:', reactRoot ? '✅' : '❌');
    
    // Procurar por elementos com classes específicas do ChatEV
    const chatElements = document.querySelectorAll('[class*="Chat"], [class*="Message"], [class*="Container"]');
    console.log('Elementos específicos do chat:', chatElements.length);
    
    if (chatElements.length > 0) {
      console.log('Elementos específicos encontrados:');
      chatElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 3. Verificar se há elementos de formulário
    console.log('\n3️⃣ VERIFICANDO ELEMENTOS DE FORMULÁRIO');
    
    const textarea = document.querySelector('textarea');
    const form = document.querySelector('form');
    const submitButton = document.querySelector('button[type="submit"]') || 
                        document.querySelector('button:contains("Enviar")') ||
                        document.querySelector('button:contains("📤")');
    
    if (!textarea || !form || !submitButton) {
      console.log('❌ Elementos do formulário não encontrados');
      return;
    }
    
    console.log('✅ Todos os elementos encontrados');

    // 4. Verificar se há elementos de mensagem
    console.log('\n4️⃣ VERIFICANDO ELEMENTOS DE MENSAGEM');
    
    const messageElements = document.querySelectorAll('[class*="Message"], [class*="message"]');
    console.log('Elementos de mensagem:', messageElements.length);
    
    if (messageElements.length > 0) {
      console.log('Elementos de mensagem encontrados:');
      messageElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    } else {
      console.log('❌ Nenhuma mensagem encontrada');
    }

    // 5. Verificar se há elementos de container
    console.log('\n5️⃣ VERIFICANDO ELEMENTOS DE CONTAINER');
    
    const containerElements = document.querySelectorAll('[class*="Container"], [class*="container"]');
    console.log('Elementos de container:', containerElements.length);
    
    if (containerElements.length > 0) {
      console.log('Elementos de container encontrados:');
      containerElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 6. Verificar se há elementos de carregamento
    console.log('\n6️⃣ VERIFICANDO ELEMENTOS DE CARREGAMENTO');
    
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spinner"]');
    console.log('Elementos de carregamento:', loadingElements.length);
    
    if (loadingElements.length > 0) {
      console.log('⚠️ Página ainda pode estar carregando');
      console.log('Elementos de carregamento encontrados:');
      loadingElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 50));
      });
    }

    // 7. Verificar se há elementos de erro
    console.log('\n7️⃣ VERIFICANDO ELEMENTOS DE ERRO');
    
    const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], [class*="invalid"]');
    console.log('Elementos de erro:', errorElements.length);
    
    if (errorElements.length > 0) {
      console.log('❌ Elementos de erro encontrados:');
      errorElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    }

    // 8. Verificar se há elementos de toast/notificação
    console.log('\n8️⃣ VERIFICANDO ELEMENTOS DE TOAST/NOTIFICAÇÃO');
    
    const toastElements = document.querySelectorAll('[class*="toast"], [class*="Toast"], [class*="notification"]');
    console.log('Elementos de toast/notificação:', toastElements.length);
    
    if (toastElements.length > 0) {
      console.log('Elementos de toast encontrados:');
      toastElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    }

    // 9. Verificar se há elementos de contexto de autenticação
    console.log('\n9️⃣ VERIFICANDO CONTEXTO DE AUTENTICAÇÃO');
    
    // Procurar por elementos que indicam que o usuário está logado
    const authElements = document.querySelectorAll('[class*="User"], [class*="Profile"], [class*="Avatar"], [class*="Username"]');
    console.log('Elementos de autenticação:', authElements.length);
    
    if (authElements.length > 0) {
      console.log('✅ Elementos de autenticação encontrados');
      authElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 50));
      });
    } else {
      console.log('❌ Nenhum elemento de autenticação encontrado');
      console.log('💡 Isso pode indicar que o usuário não está logado');
    }

    // 10. Verificar se há elementos de navbar
    console.log('\n10️⃣ VERIFICANDO NAVBAR');
    
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

    // 11. Verificar se há elementos específicos do ChatEV
    console.log('\n11️⃣ VERIFICANDO ELEMENTOS ESPECÍFICOS DO CHATEV');
    
    // Procurar por elementos com classes específicas do ChatEV
    const chatSpecificElements = document.querySelectorAll('[class*="ChatEV"], [class*="ChatEV"], [class*="chat-ev"]');
    console.log('Elementos específicos do ChatEV:', chatSpecificElements.length);
    
    if (chatSpecificElements.length > 0) {
      console.log('Elementos específicos do ChatEV encontrados:');
      chatSpecificElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 12. Verificar se há elementos de styled-components
    console.log('\n12️⃣ VERIFICANDO ELEMENTOS DE STYLED-COMPONENTS');
    
    // Procurar por elementos com classes de styled-components (geralmente começam com 'sc-')
    const styledElements = document.querySelectorAll('[class*="sc-"]');
    console.log('Elementos de styled-components:', styledElements.length);
    
    if (styledElements.length > 0) {
      console.log('Elementos de styled-components encontrados:');
      styledElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 13. Resumo final
    console.log('\n🎯 RESUMO FINAL');
    console.log('===============');
    
    if (authElements.length === 0) {
      console.log('❌ PROBLEMA PRINCIPAL: Usuário não está logado');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Fazer login novamente');
      console.log('2. Verificar se há problemas de sessão');
      console.log('3. Recarregar a página (F5)');
    } else if (loadingElements.length > 0) {
      console.log('⚠️ PROBLEMA: Página ainda está carregando');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Aguardar o carregamento completo');
      console.log('2. Recarregar a página (F5)');
    } else if (errorElements.length > 0) {
      console.log('❌ PROBLEMA: Há erros na página');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar erros JavaScript no console');
      console.log('2. Recarregar a página (F5)');
    } else if (messageElements.length === 0 && chatSpecificElements.length === 0) {
      console.log('❌ PROBLEMA: Componente ChatEV não está sendo renderizado');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há erros JavaScript no console');
      console.log('2. Recarregar a página (F5)');
      console.log('3. Verificar se o componente está sendo importado');
    } else {
      console.log('✅ Componente ChatEV está sendo renderizado');
      console.log('💡 PROBLEMA: Botão está sendo desabilitado por JavaScript');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há JavaScript que desabilita o botão');
      console.log('2. Verificar se há problemas de validação');
      console.log('3. Verificar se há problemas de contexto');
    }

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    console.log('Stack trace:', error.stack);
  }
};

// Executar diagnóstico
verificarAuthChatEV();
