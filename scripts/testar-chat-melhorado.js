// Script melhorado para testar o chat público
// Execute este script no console do navegador

console.log('🧪 Teste melhorado do chat público...');

// Função para testar diretamente
const testarChatMelhorado = async () => {
  try {
    // Verificar se estamos na página do chat
    if (!window.location.pathname.includes('/chat')) {
      console.log('⚠️ Você não está na página do chat');
      console.log('💡 Navegue para /chat primeiro');
      return;
    }
    
    console.log('✅ Está na página do chat');
    
    // Verificar se há elementos do chat na página usando seletores mais específicos
    console.log('\n🔍 Procurando elementos do chat...');
    
    // Procurar por elementos com estilos específicos
    const allDivs = document.querySelectorAll('div');
    let chatContainer = null;
    let messagesContainer = null;
    let messageForm = null;
    let textArea = null;
    let submitButton = null;
    
    // Procurar container principal (background: #1a1a1a)
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      if (style.backgroundColor === 'rgb(26, 26, 26)' && 
          style.maxWidth === '800px' && 
          style.margin === '0px auto') {
        chatContainer = div;
        console.log('✅ Container principal encontrado');
        break;
      }
    }
    
    // Procurar container de mensagens (background: #2a2a2a)
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      if (style.backgroundColor === 'rgb(42, 42, 42)' && 
          style.height === '500px' && 
          style.overflowY === 'auto') {
        messagesContainer = div;
        console.log('✅ Container de mensagens encontrado');
        break;
      }
    }
    
    // Procurar formulário (background: #2a2a2a com padding: 20px)
    for (let form of document.querySelectorAll('form')) {
      const style = window.getComputedStyle(form);
      if (style.backgroundColor === 'rgb(42, 42, 42)' && 
          style.padding === '20px') {
        messageForm = form;
        console.log('✅ Formulário encontrado');
        break;
      }
    }
    
    // Procurar textarea
    textArea = document.querySelector('textarea');
    if (textArea) {
      console.log('✅ Textarea encontrado');
    }
    
    // Procurar botão de envio
    for (let button of document.querySelectorAll('button')) {
      const text = button.textContent || button.innerText;
      if (text.includes('Enviar') || text.includes('📤')) {
        submitButton = button;
        console.log('✅ Botão de envio encontrado');
        break;
      }
    }
    
    // Verificar se encontramos os elementos principais
    if (!chatContainer) {
      console.log('❌ Container principal não encontrado');
      console.log('💡 Verifique se você está na página correta');
      return;
    }
    
    if (!messagesContainer) {
      console.log('❌ Container de mensagens não encontrado');
      return;
    }
    
    if (!messageForm) {
      console.log('❌ Formulário não encontrado');
      return;
    }
    
    if (!textArea) {
      console.log('❌ Textarea não encontrado');
      return;
    }
    
    if (!submitButton) {
      console.log('❌ Botão de envio não encontrado');
      return;
    }
    
    console.log('\n✅ Todos os elementos principais encontrados!');
    
    // Verificar se há mensagens na tela
    const messages = messagesContainer.querySelectorAll('div');
    let messageCount = 0;
    
    for (let div of messages) {
      const style = window.getComputedStyle(div);
      if (style.marginBottom === '15px' && 
          style.padding === '15px' && 
          style.borderRadius === '8px') {
        messageCount++;
      }
    }
    
    console.log('📊 Mensagens visíveis:', messageCount);
    
    // Verificar se há indicadores de carregamento
    const loadingText = messagesContainer.textContent || messagesContainer.innerText;
    if (loadingText.includes('Carregando')) {
      console.log('⏳ Chat ainda carregando...');
      return;
    }
    
    // Verificar se há estado vazio
    if (loadingText.includes('Seja o primeiro') || loadingText.includes('experiência')) {
      console.log('📝 Chat vazio - nenhuma mensagem ainda');
    }
    
    // Verificar se há erros no console
    const originalError = console.error;
    const errors = [];
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Tentar enviar uma mensagem de teste
    console.log('\n🧪 Tentando enviar mensagem de teste...');
    
    // Simular digitação
    textArea.value = `🧪 Teste melhorado ${new Date().toLocaleTimeString()}`;
    textArea.dispatchEvent(new Event('input', { bubbles: true }));
    textArea.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('✅ Texto inserido no campo');
    
    // Verificar se o botão está habilitado
    if (submitButton.disabled) {
      console.log('⚠️ Botão de envio está desabilitado');
      console.log('💡 Verifique se o texto foi inserido corretamente');
    }
    
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
          
          // Verificar se a mensagem apareceu
          setTimeout(() => {
            const newMessageCount = messagesContainer.querySelectorAll('div').length;
            if (newMessageCount > messageCount) {
              console.log('✅ Nova mensagem apareceu na tela!');
            } else {
              console.log('⚠️ Nova mensagem não apareceu na tela');
            }
            
            // Restaurar console.error original
            console.error = originalError;
          }, 2000);
          
        }, 2000);
        
      } catch (clickError) {
        console.error('❌ Erro ao clicar no botão:', clickError);
      }
    }, 1000);
    
    console.log('\n🎉 Teste melhorado concluído!');
    console.log('💡 Verifique os resultados acima para identificar problemas');
    
  } catch (error) {
    console.error('❌ Erro no teste melhorado:', error);
  }
};

// Executar teste
testarChatMelhorado();
