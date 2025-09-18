// Script para verificar problemas específicos do componente ChatEV
// Execute este script no console do navegador na página /chat

console.log('🔍 VERIFICANDO COMPONENTE CHATEV');
console.log('===============================');

const verificarComponenteChat = async () => {
  try {
    // 1. Verificar se estamos na página correta
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      return;
    }
    console.log('✅ Está na página /chat');

    // 2. Verificar se há erros específicos do ChatEV
    console.log('\n2️⃣ VERIFICANDO ERROS ESPECÍFICOS');
    
    // Capturar erros por 3 segundos
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
      const errorMsg = args.join(' ');
      errors.push(errorMsg);
      originalError.apply(console, args);
    };

    // Aguardar para capturar erros
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Restaurar console original
    console.error = originalError;
    
    if (errors.length > 0) {
      console.log('❌ Erros encontrados:');
      errors.forEach(error => console.log(' -', error));
    } else {
      console.log('✅ Nenhum erro encontrado');
    }

    // 3. Verificar se há elementos do ChatEV
    console.log('\n3️⃣ VERIFICANDO ELEMENTOS DO CHATEV');
    
    // Procurar por elementos específicos do ChatEV
    const chatElements = {
      container: null,
      header: null,
      messagesContainer: null,
      form: null,
      textarea: null,
      submitButton: null
    };

    // Procurar container principal
    const allDivs = document.querySelectorAll('div');
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      if (style.backgroundColor === 'rgb(26, 26, 26)' && 
          style.maxWidth === '800px' && 
          style.margin === '0px auto') {
        chatElements.container = div;
        break;
      }
    }

    // Procurar header do chat
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      if (style.backgroundColor === 'rgba(74, 106, 138, 0.1)' && 
          style.border === '2px solid rgb(74, 106, 138)') {
        chatElements.header = div;
        break;
      }
    }

    // Procurar container de mensagens
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      if (style.backgroundColor === 'rgb(42, 42, 42)' && 
          style.height === '500px' && 
          style.overflowY === 'auto') {
        chatElements.messagesContainer = div;
        break;
      }
    }

    // Procurar formulário
    const forms = document.querySelectorAll('form');
    for (let form of forms) {
      const style = window.getComputedStyle(form);
      if (style.backgroundColor === 'rgb(42, 42, 42)' && 
          style.padding === '20px') {
        chatElements.form = form;
        break;
      }
    }

    // Procurar textarea
    chatElements.textarea = document.querySelector('textarea');

    // Procurar botão de envio
    const buttons = document.querySelectorAll('button');
    for (let button of buttons) {
      const text = button.textContent || button.innerText;
      if (text.includes('Enviar') || text.includes('📤')) {
        chatElements.submitButton = button;
        break;
      }
    }

    // 4. Mostrar resultados
    console.log('\n4️⃣ RESULTADOS DA BUSCA');
    console.log('Container principal:', chatElements.container ? '✅' : '❌');
    console.log('Header do chat:', chatElements.header ? '✅' : '❌');
    console.log('Container de mensagens:', chatElements.messagesContainer ? '✅' : '❌');
    console.log('Formulário:', chatElements.form ? '✅' : '❌');
    console.log('Textarea:', chatElements.textarea ? '✅' : '❌');
    console.log('Botão de envio:', chatElements.submitButton ? '✅' : '❌');

    // 5. Se nenhum elemento foi encontrado, verificar alternativas
    if (!chatElements.container && !chatElements.messagesContainer) {
      console.log('\n5️⃣ ELEMENTOS NÃO ENCONTRADOS - VERIFICANDO ALTERNATIVAS');
      
      // Verificar se há qualquer elemento com estilos similares
      let similarElements = 0;
      allDivs.forEach(div => {
        const style = window.getComputedStyle(div);
        if (style.backgroundColor === 'rgb(26, 26, 26)' || 
            style.backgroundColor === 'rgb(42, 42, 42)' ||
            style.maxWidth === '800px') {
          similarElements++;
        }
      });
      
      console.log('Elementos com estilos similares:', similarElements);
      
      if (similarElements === 0) {
        console.log('❌ Nenhum elemento com estilos do chat encontrado');
        console.log('💡 Possíveis causas:');
        console.log('1. Componente ChatEV não está sendo renderizado');
        console.log('2. Erro na importação do componente');
        console.log('3. Problema de rota');
        console.log('4. Usuário não está logado');
      }
    }

    // 6. Verificar se há elementos de carregamento
    console.log('\n6️⃣ VERIFICANDO CARREGAMENTO');
    
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spinner"]');
    console.log('Elementos de carregamento:', loadingElements.length);
    
    if (loadingElements.length > 0) {
      console.log('⚠️ Página ainda pode estar carregando');
    }

    // 7. Verificar se há elementos de erro
    console.log('\n7️⃣ VERIFICANDO ERROS VISUAIS');
    
    const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], [class*="not-found"]');
    console.log('Elementos de erro:', errorElements.length);
    
    if (errorElements.length > 0) {
      console.log('❌ Elementos de erro encontrados');
    }

    // 8. Verificar se há elementos do React
    console.log('\n8️⃣ VERIFICANDO REACT');
    
    const styledElements = document.querySelectorAll('[class*="sc-"]');
    console.log('Elementos styled-components:', styledElements.length);
    
    if (styledElements.length === 0) {
      console.log('❌ React pode não estar funcionando');
    } else {
      console.log('✅ React está funcionando');
    }

    // 9. Verificar se há elementos específicos do ChatEV
    console.log('\n9️⃣ VERIFICANDO ELEMENTOS ESPECÍFICOS');
    
    // Procurar por elementos com classes específicas do ChatEV
    const chatSpecificElements = document.querySelectorAll('[class*="Chat"], [class*="Message"], [class*="Container"]');
    console.log('Elementos específicos do chat:', chatSpecificElements.length);
    
    if (chatSpecificElements.length > 0) {
      console.log('Primeiros elementos específicos:');
      chatSpecificElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
      });
    }

    // 10. Resumo final
    console.log('\n🎯 RESUMO FINAL');
    console.log('===============');
    
    const totalElements = Object.values(chatElements).filter(el => el !== null).length;
    
    if (totalElements === 0) {
      console.log('❌ PROBLEMA: Componente ChatEV não está sendo renderizado');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há erros JavaScript no console');
      console.log('2. Recarregar a página (F5)');
      console.log('3. Verificar se o usuário está logado');
      console.log('4. Verificar se a rota /chat está configurada');
      console.log('5. Verificar se o componente ChatEV está sendo importado');
    } else if (totalElements < 3) {
      console.log('⚠️ PROBLEMA: Componente ChatEV está renderizando parcialmente');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há erros específicos do componente');
      console.log('2. Verificar se há problemas de dependências');
      console.log('3. Verificar se há problemas de estado');
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
verificarComponenteChat();
