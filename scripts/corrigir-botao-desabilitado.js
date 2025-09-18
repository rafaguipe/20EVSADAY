// Script para corrigir o problema do botão desabilitado
// Execute este script no console do navegador na página /chat

console.log('🔧 CORRIGINDO BOTÃO DESABILITADO');
console.log('================================');

const corrigirBotaoDesabilitado = async () => {
  try {
    // 1. Verificar se estamos na página correta
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      return;
    }
    console.log('✅ Está na página /chat');

    // 2. Encontrar elementos do formulário
    console.log('\n2️⃣ ENCONTRANDO ELEMENTOS DO FORMULÁRIO');
    
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

    // 3. Verificar estado atual do botão
    console.log('\n3️⃣ VERIFICANDO ESTADO ATUAL DO BOTÃO');
    
    console.log('Botão desabilitado:', submitButton.disabled);
    console.log('Texto do botão:', submitButton.textContent || submitButton.innerText);
    console.log('Classe do botão:', submitButton.className);
    
    // Verificar se há texto no textarea
    console.log('Texto no textarea:', textarea.value);
    console.log('Textarea vazio:', textarea.value.trim() === '');

    // 4. Tentar corrigir o botão
    console.log('\n4️⃣ TENTANDO CORRIGIR O BOTÃO');
    
    // Inserir texto no textarea
    const testMessage = `🧪 Teste correção botão ${new Date().toLocaleTimeString()}`;
    textarea.value = testMessage;
    
    // Disparar eventos para simular digitação
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    textarea.dispatchEvent(new Event('keyup', { bubbles: true }));
    
    console.log('✅ Texto inserido:', testMessage);
    
    // Aguardar um pouco e verificar se o botão foi habilitado
    setTimeout(() => {
      console.log('Botão desabilitado após inserir texto:', submitButton.disabled);
      
      if (submitButton.disabled) {
        console.log('❌ Botão ainda está desabilitado');
        console.log('💡 Tentando forçar habilitação...');
        
        // Tentar forçar habilitação
        submitButton.disabled = false;
        console.log('✅ Botão forçadamente habilitado');
        
        // Verificar se funcionou
        setTimeout(() => {
          console.log('Botão desabilitado após forçar:', submitButton.disabled);
          
          if (!submitButton.disabled) {
            console.log('✅ Botão agora está habilitado!');
            console.log('💡 Tentando enviar mensagem...');
            
            // Tentar enviar mensagem
            try {
              submitButton.click();
              console.log('✅ Botão de envio clicado');
              
              // Verificar se a mensagem apareceu
              setTimeout(() => {
                verificarMensagemEnviada();
              }, 3000);
              
            } catch (clickError) {
              console.error('❌ Erro ao clicar no botão:', clickError);
            }
          } else {
            console.log('❌ Botão ainda está desabilitado mesmo após forçar');
            console.log('💡 Pode haver JavaScript que está desabilitando o botão');
          }
        }, 1000);
        
      } else {
        console.log('✅ Botão foi habilitado automaticamente');
        console.log('💡 Tentando enviar mensagem...');
        
        // Tentar enviar mensagem
        try {
          submitButton.click();
          console.log('✅ Botão de envio clicado');
          
          // Verificar se a mensagem apareceu
          setTimeout(() => {
            verificarMensagemEnviada();
          }, 3000);
          
        } catch (clickError) {
          console.error('❌ Erro ao clicar no botão:', clickError);
        }
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Erro na correção:', error);
    console.log('Stack trace:', error.stack);
  }
};

const verificarMensagemEnviada = async () => {
  try {
    console.log('\n5️⃣ VERIFICANDO SE MENSAGEM FOI ENVIADA');
    
    // Verificar se há mensagens na página
    const messageElements = document.querySelectorAll('[class*="Message"], [class*="message"]');
    console.log('Elementos de mensagem na página:', messageElements.length);
    
    if (messageElements.length > 0) {
      console.log('✅ Mensagens encontradas na página');
      messageElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    } else {
      console.log('❌ Nenhuma mensagem encontrada na página');
    }
    
    // Verificar se há elementos de carregamento
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spinner"]');
    console.log('Elementos de carregamento:', loadingElements.length);
    
    if (loadingElements.length > 0) {
      console.log('⚠️ Página ainda pode estar carregando');
    }
    
    // Verificar se há elementos de erro
    const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
    console.log('Elementos de erro:', errorElements.length);
    
    if (errorElements.length > 0) {
      console.log('❌ Elementos de erro encontrados:');
      errorElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    }
    
    // Verificar se há elementos de sucesso
    const successElements = document.querySelectorAll('[class*="success"], [class*="Success"]');
    console.log('Elementos de sucesso:', successElements.length);
    
    if (successElements.length > 0) {
      console.log('✅ Elementos de sucesso encontrados:');
      successElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    }
    
    // Verificar se há elementos de toast/notificação
    const toastElements = document.querySelectorAll('[class*="toast"], [class*="Toast"], [class*="notification"]');
    console.log('Elementos de toast/notificação:', toastElements.length);
    
    if (toastElements.length > 0) {
      console.log('Elementos de toast encontrados:');
      toastElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 100));
      });
    }
    
    // Resumo final
    console.log('\n🎯 RESUMO DA CORREÇÃO');
    console.log('====================');
    
    if (messageElements.length === 0) {
      console.log('❌ PROBLEMA: Mensagem ainda não foi enviada');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há erros JavaScript no console');
      console.log('2. Verificar se há problemas de conexão com Supabase');
      console.log('3. Verificar se há problemas de permissão');
      console.log('4. Verificar se há problemas de Realtime');
      console.log('5. Recarregar a página (F5)');
    } else {
      console.log('✅ Mensagem foi enviada e está sendo exibida');
      console.log('🎉 PROBLEMA RESOLVIDO!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar mensagem:', error);
  }
};

// Executar correção
corrigirBotaoDesabilitado();
