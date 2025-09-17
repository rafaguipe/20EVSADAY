// Script simples para testar o chat público diretamente
// Execute este script no console do navegador

console.log('🧪 Teste simples do chat público...');

// Função para testar diretamente
const testarChatSimples = async () => {
  try {
    // Verificar se estamos na página do chat
    if (!window.location.pathname.includes('/chat')) {
      console.log('⚠️ Você não está na página do chat');
      console.log('💡 Navegue para /chat primeiro');
      return;
    }
    
    // Verificar se há elementos do chat na página
    const chatContainer = document.querySelector('[data-testid="chat-container"]') ||
                         document.querySelector('.chat-container') ||
                         document.querySelector('div[style*="background: #2a2a2a"]');
    
    if (!chatContainer) {
      console.log('⚠️ Elementos do chat não encontrados na página');
      console.log('💡 Verifique se você está na página correta');
      return;
    }
    
    console.log('✅ Elementos do chat encontrados');
    
    // Verificar se há formulário de envio
    const messageForm = document.querySelector('form') ||
                       document.querySelector('textarea') ||
                       document.querySelector('input[type="text"]');
    
    if (!messageForm) {
      console.log('⚠️ Formulário de envio não encontrado');
      return;
    }
    
    console.log('✅ Formulário de envio encontrado');
    
    // Verificar se há mensagens na tela
    const messages = document.querySelectorAll('[data-testid="message"]') ||
                    document.querySelectorAll('.message-item') ||
                    document.querySelectorAll('div[style*="margin-bottom: 15px"]');
    
    console.log('📊 Mensagens visíveis:', messages.length);
    
    // Verificar se há botão de envio
    const submitButton = document.querySelector('button[type="submit"]') ||
                        document.querySelector('button:contains("Enviar")') ||
                        document.querySelector('button:contains("📤")');
    
    if (!submitButton) {
      console.log('⚠️ Botão de envio não encontrado');
      return;
    }
    
    console.log('✅ Botão de envio encontrado');
    
    // Verificar se há erros no console
    const originalError = console.error;
    const errors = [];
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Tentar enviar uma mensagem de teste
    console.log('\n🧪 Tentando enviar mensagem de teste...');
    
    // Encontrar o campo de texto
    const textArea = document.querySelector('textarea') ||
                    document.querySelector('input[type="text"]');
    
    if (textArea) {
      // Simular digitação
      textArea.value = `🧪 Teste simples ${new Date().toLocaleTimeString()}`;
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
      textArea.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log('✅ Texto inserido no campo');
      
      // Tentar clicar no botão de envio
      setTimeout(() => {
        try {
          submitButton.click();
          console.log('✅ Botão de envio clicado');
          
          // Verificar se há erros após o clique
          setTimeout(() => {
            if (errors.length > 0) {
              console.log('❌ Erros encontrados após envio:');
              errors.forEach(error => console.log('  -', error));
            } else {
              console.log('✅ Nenhum erro encontrado após envio');
            }
            
            // Restaurar console.error original
            console.error = originalError;
          }, 2000);
          
        } catch (clickError) {
          console.error('❌ Erro ao clicar no botão:', clickError);
        }
      }, 1000);
      
    } else {
      console.log('❌ Campo de texto não encontrado');
    }
    
    // Verificar se há indicadores de carregamento
    const loadingElements = document.querySelectorAll('[data-testid="loading"]') ||
                           document.querySelectorAll('.loading') ||
                           document.querySelectorAll('div:contains("Carregando")');
    
    if (loadingElements.length > 0) {
      console.log('⏳ Elementos de carregamento encontrados:', loadingElements.length);
    }
    
    // Verificar se há indicadores de erro
    const errorElements = document.querySelectorAll('[data-testid="error"]') ||
                         document.querySelectorAll('.error') ||
                         document.querySelectorAll('div:contains("Erro")');
    
    if (errorElements.length > 0) {
      console.log('❌ Elementos de erro encontrados:', errorElements.length);
    }
    
    console.log('\n🎉 Teste simples concluído!');
    console.log('💡 Verifique os resultados acima para identificar problemas');
    
  } catch (error) {
    console.error('❌ Erro no teste simples:', error);
  }
};

// Executar teste
testarChatSimples();
