// Script para verificar por que o ChatEV não está renderizando
// Execute este script no console do navegador na página /chat

console.log('🔍 VERIFICANDO RENDERIZAÇÃO DO CHAT');
console.log('==================================');

const verificarRenderizacaoChat = async () => {
  try {
    // 1. Verificar se estamos na página correta
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      return;
    }
    console.log('✅ Está na página /chat');

    // 2. Verificar se há erros JavaScript
    console.log('\n2️⃣ VERIFICANDO ERROS JAVASCRIPT');
    const originalError = console.error;
    const originalWarn = console.warn;
    const errors = [];
    const warnings = [];
    
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
      warnings.push(args.join(' '));
      originalWarn.apply(console, args);
    };

    // Aguardar um pouco para capturar erros
    setTimeout(() => {
      if (errors.length > 0) {
        console.log('❌ Erros encontrados:');
        errors.forEach(error => console.log(' -', error));
      } else {
        console.log('✅ Nenhum erro JavaScript encontrado');
      }
      
      if (warnings.length > 0) {
        console.log('⚠️ Avisos encontrados:');
        warnings.forEach(warning => console.log(' -', warning));
      }
      
      // Restaurar console original
      console.error = originalError;
      console.warn = originalWarn;
    }, 2000);

    // 3. Verificar elementos básicos da página
    console.log('\n3️⃣ VERIFICANDO ELEMENTOS BÁSICOS');
    
    const body = document.body;
    const root = document.querySelector('#root');
    const main = document.querySelector('main');
    
    console.log('Body:', body ? '✅' : '❌');
    console.log('Root (#root):', root ? '✅' : '❌');
    console.log('Main:', main ? '✅' : '❌');
    
    if (root) {
      console.log('Conteúdo do root:', root.innerHTML.substring(0, 200) + '...');
    }

    // 4. Verificar se há elementos do ChatEV
    console.log('\n4️⃣ VERIFICANDO ELEMENTOS DO CHAT');
    
    // Procurar por qualquer elemento que possa ser do chat
    const possibleChatElements = [
      document.querySelector('textarea'),
      document.querySelector('form'),
      document.querySelector('button'),
      document.querySelector('[class*="Chat"]'),
      document.querySelector('[class*="Message"]'),
      document.querySelector('[class*="Container"]')
    ];
    
    possibleChatElements.forEach((el, i) => {
      if (el) {
        console.log(`Elemento ${i + 1} encontrado:`, el.tagName, el.className || 'sem classe');
      }
    });

    // 5. Verificar se há indicadores de carregamento
    console.log('\n5️⃣ VERIFICANDO INDICADORES DE CARREGAMENTO');
    
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spinner"]');
    console.log('Elementos de carregamento:', loadingElements.length);
    
    if (loadingElements.length > 0) {
      console.log('Possível problema: Página ainda carregando');
    }

    // 6. Verificar se há erros de rota
    console.log('\n6️⃣ VERIFICANDO ROTA');
    
    // Verificar se há elementos de erro de rota
    const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], [class*="not-found"]');
    console.log('Elementos de erro:', errorElements.length);
    
    if (errorElements.length > 0) {
      console.log('Possível problema: Erro de rota');
    }

    // 7. Verificar se há elementos do React
    console.log('\n7️⃣ VERIFICANDO ELEMENTOS REACT');
    
    // Procurar por elementos com classes do styled-components
    const styledElements = document.querySelectorAll('[class*="sc-"]');
    console.log('Elementos styled-components:', styledElements.length);
    
    if (styledElements.length > 0) {
      console.log('✅ React está funcionando');
    } else {
      console.log('❌ React pode não estar funcionando');
    }

    // 8. Verificar se há elementos específicos do ChatEV
    console.log('\n8️⃣ VERIFICANDO ELEMENTOS ESPECÍFICOS DO CHAT');
    
    // Procurar por elementos com estilos específicos do ChatEV
    const allDivs = document.querySelectorAll('div');
    let foundChatElements = 0;
    
    allDivs.forEach(div => {
      const style = window.getComputedStyle(div);
      if (style.backgroundColor === 'rgb(26, 26, 26)' || 
          style.backgroundColor === 'rgb(42, 42, 42)' ||
          style.maxWidth === '800px') {
        foundChatElements++;
      }
    });
    
    console.log('Elementos com estilos do chat:', foundChatElements);
    
    if (foundChatElements === 0) {
      console.log('❌ Nenhum elemento do chat encontrado');
      console.log('💡 Possíveis causas:');
      console.log('1. Componente ChatEV não está sendo importado');
      console.log('2. Erro na renderização do componente');
      console.log('3. Problema de rota');
      console.log('4. Usuário não está logado');
    }

    // 9. Verificar se usuário está logado
    console.log('\n9️⃣ VERIFICANDO AUTENTICAÇÃO');
    
    // Procurar por elementos que indicam que o usuário está logado
    const authElements = document.querySelectorAll('[class*="User"], [class*="Profile"], [class*="Avatar"]');
    console.log('Elementos de autenticação:', authElements.length);
    
    // Verificar se há navbar (indica que a página carregou)
    const navbar = document.querySelector('nav');
    console.log('Navbar encontrada:', navbar ? '✅' : '❌');

    // 10. Verificar se há elementos de erro específicos
    console.log('\n10️⃣ VERIFICANDO ERROS ESPECÍFICOS');
    
    // Procurar por mensagens de erro
    const errorMessages = document.querySelectorAll('*');
    let errorFound = false;
    
    errorMessages.forEach(el => {
      const text = el.textContent || '';
      if (text.includes('Erro') || text.includes('Error') || text.includes('404') || text.includes('500')) {
        if (!errorFound) {
          console.log('❌ Mensagem de erro encontrada:', text.substring(0, 100));
          errorFound = true;
        }
      }
    });
    
    if (!errorFound) {
      console.log('✅ Nenhuma mensagem de erro encontrada');
    }

    console.log('\n🎯 RESUMO DO DIAGNÓSTICO');
    console.log('========================');
    
    if (foundChatElements === 0 && styledElements.length === 0) {
      console.log('❌ PROBLEMA: React não está funcionando ou componente não está sendo renderizado');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Recarregar a página (F5)');
      console.log('2. Verificar se há erros no console');
      console.log('3. Verificar se o usuário está logado');
      console.log('4. Verificar se a rota /chat está configurada');
    } else if (foundChatElements === 0 && styledElements.length > 0) {
      console.log('❌ PROBLEMA: React funciona, mas componente ChatEV não está sendo renderizado');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há erros específicos do ChatEV');
      console.log('2. Verificar se o componente está sendo importado');
      console.log('3. Verificar se há problemas de dependências');
    } else {
      console.log('✅ Componente está sendo renderizado');
      console.log('💡 Problema pode ser específico do envio de mensagens');
    }

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    console.log('Stack trace:', error.stack);
  }
};

// Executar diagnóstico
verificarRenderizacaoChat();
