// Script completo para diagnosticar o chat público
// Execute este script no console do navegador quando estiver na página /chat

console.log('🔍 DIAGNÓSTICO COMPLETO DO CHAT PÚBLICO');
console.log('=====================================');

const diagnosticarChatPublico = async () => {
  try {
    // 1. Verificar se estamos na página correta
    console.log('\n1️⃣ VERIFICANDO PÁGINA');
    console.log('URL atual:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      console.log('💡 Navegue para /chat primeiro');
      return;
    }
    console.log('✅ Está na página do chat');

    // 2. Verificar se Supabase está disponível
    console.log('\n2️⃣ VERIFICANDO SUPABASE');
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase não está disponível globalmente');
      console.log('💡 Tentando acessar via React context...');
      
      // Tentar acessar via React DevTools
      const reactRoot = document.querySelector('#root');
      if (reactRoot && reactRoot._reactInternalFiber) {
        console.log('✅ React root encontrado');
      } else {
        console.log('❌ Não foi possível acessar React context');
        return;
      }
    } else {
      console.log('✅ Supabase disponível globalmente');
    }

    // 3. Verificar elementos da página
    console.log('\n3️⃣ VERIFICANDO ELEMENTOS DA PÁGINA');
    
    // Procurar por elementos com estilos específicos do ChatEV
    const allDivs = document.querySelectorAll('div');
    let chatElements = {
      container: null,
      messagesContainer: null,
      form: null,
      textarea: null,
      submitButton: null
    };

    // Procurar container principal (background: #1a1a1a, max-width: 800px)
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      if (style.backgroundColor === 'rgb(26, 26, 26)' && 
          style.maxWidth === '800px' && 
          style.margin === '0px auto') {
        chatElements.container = div;
        console.log('✅ Container principal encontrado');
        break;
      }
    }

    // Procurar container de mensagens (background: #2a2a2a, height: 500px)
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      if (style.backgroundColor === 'rgb(42, 42, 42)' && 
          style.height === '500px' && 
          style.overflowY === 'auto') {
        chatElements.messagesContainer = div;
        console.log('✅ Container de mensagens encontrado');
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
        console.log('✅ Formulário encontrado');
        break;
      }
    }

    // Procurar textarea
    chatElements.textarea = document.querySelector('textarea');
    if (chatElements.textarea) {
      console.log('✅ Textarea encontrado');
    }

    // Procurar botão de envio
    const buttons = document.querySelectorAll('button');
    for (let button of buttons) {
      const text = button.textContent || button.innerText;
      if (text.includes('Enviar') || text.includes('📤')) {
        chatElements.submitButton = button;
        console.log('✅ Botão de envio encontrado');
        break;
      }
    }

    // 4. Verificar se todos os elementos foram encontrados
    console.log('\n4️⃣ RESUMO DOS ELEMENTOS');
    console.log('Container principal:', chatElements.container ? '✅' : '❌');
    console.log('Container de mensagens:', chatElements.messagesContainer ? '✅' : '❌');
    console.log('Formulário:', chatElements.form ? '✅' : '❌');
    console.log('Textarea:', chatElements.textarea ? '✅' : '❌');
    console.log('Botão de envio:', chatElements.submitButton ? '✅' : '❌');

    // 5. Se elementos não foram encontrados, tentar diagnóstico alternativo
    if (!chatElements.container || !chatElements.messagesContainer) {
      console.log('\n5️⃣ DIAGNÓSTICO ALTERNATIVO');
      console.log('Elementos principais não encontrados. Verificando componentes React...');
      
      // Procurar por elementos com classes ou atributos específicos
      const reactElements = document.querySelectorAll('[class*="styled"], [data-testid], [class*="Container"], [class*="Message"]');
      console.log('Elementos React encontrados:', reactElements.length);
      
      if (reactElements.length > 0) {
        console.log('Primeiros elementos React:');
        reactElements.slice(0, 5).forEach((el, i) => {
          console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe');
        });
      }

      // Verificar se há erros no console
      console.log('\n6️⃣ VERIFICANDO ERROS');
      const originalError = console.error;
      const errors = [];
      console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
      };

      // Tentar interagir com elementos encontrados
      if (chatElements.textarea && chatElements.submitButton) {
        console.log('\n7️⃣ TESTANDO INTERAÇÃO');
        try {
          chatElements.textarea.value = `🧪 Teste diagnóstico ${new Date().toLocaleTimeString()}`;
          chatElements.textarea.dispatchEvent(new Event('input', { bubbles: true }));
          chatElements.textarea.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✅ Texto inserido no textarea');
          
          setTimeout(() => {
            try {
              chatElements.submitButton.click();
              console.log('✅ Botão de envio clicado');
              
              setTimeout(() => {
                if (errors.length > 0) {
                  console.log('❌ Erros encontrados após envio:');
                  errors.forEach(error => console.log(' -', error));
                } else {
                  console.log('✅ Nenhum erro encontrado após envio');
                }
                console.error = originalError;
              }, 2000);
            } catch (clickError) {
              console.error('❌ Erro ao clicar no botão:', clickError);
            }
          }, 1000);
        } catch (interactionError) {
          console.error('❌ Erro na interação:', interactionError);
        }
      }
    }

    // 8. Verificar se há mensagens visíveis
    console.log('\n8️⃣ VERIFICANDO MENSAGENS');
    const messageElements = document.querySelectorAll('[data-testid="message"], .message-item, div[style*="margin-bottom: 15px"]');
    console.log('Mensagens visíveis:', messageElements.length);
    
    if (messageElements.length > 0) {
      console.log('Primeira mensagem encontrada:', messageElements[0].textContent?.substring(0, 50) + '...');
    }

    // 9. Verificar indicadores de carregamento
    console.log('\n9️⃣ VERIFICANDO INDICADORES');
    const loadingElements = document.querySelectorAll('[data-testid="loading"], .loading, div:contains("Carregando")');
    console.log('Elementos de carregamento:', loadingElements.length);
    
    const errorElements = document.querySelectorAll('[data-testid="error"], .error, div:contains("Erro")');
    console.log('Elementos de erro:', errorElements.length);

    console.log('\n🎯 DIAGNÓSTICO CONCLUÍDO');
    console.log('========================');
    
    if (!chatElements.container || !chatElements.messagesContainer) {
      console.log('❌ PROBLEMA IDENTIFICADO: Componente ChatEV não está renderizando corretamente');
      console.log('💡 SOLUÇÕES SUGERIDAS:');
      console.log('1. Verificar se há erros JavaScript no console');
      console.log('2. Recarregar a página (F5)');
      console.log('3. Verificar se o usuário está logado');
      console.log('4. Verificar conexão com Supabase');
      console.log('5. Verificar se a tabela chat_ev_messages existe');
    } else {
      console.log('✅ Componente ChatEV está renderizando corretamente');
      console.log('💡 Se ainda não funciona, o problema pode ser:');
      console.log('1. Conexão com Supabase');
      console.log('2. Permissões da tabela');
      console.log('3. Problemas de Realtime');
    }

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    console.log('Stack trace:', error.stack);
  }
};

// Executar diagnóstico
diagnosticarChatPublico();
