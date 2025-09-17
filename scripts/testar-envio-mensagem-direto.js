// Script para testar envio de mensagem diretamente
// Execute este script no console do navegador

console.log('🧪 Testando envio de mensagem diretamente...');

// Função para testar envio direto
const testarEnvioDireto = async () => {
  try {
    // Verificar se estamos na página do chat
    if (!window.location.pathname.includes('/chat')) {
      console.log('⚠️ Você não está na página do chat');
      return;
    }
    
    console.log('✅ Está na página do chat');
    
    // Encontrar elementos
    const textarea = document.querySelector('textarea');
    const submitButton = document.querySelector('button[type="submit"]') || 
                        document.querySelector('button:contains("Enviar")') ||
                        document.querySelector('button:contains("📤")');
    
    if (!textarea) {
      console.log('❌ Textarea não encontrado');
      return;
    }
    
    if (!submitButton) {
      console.log('❌ Botão de envio não encontrado');
      return;
    }
    
    console.log('✅ Elementos encontrados');
    
    // Verificar se o botão está habilitado
    if (submitButton.disabled) {
      console.log('⚠️ Botão está desabilitado');
    }
    
    // Simular digitação
    const testMessage = `🧪 Teste direto ${new Date().toLocaleTimeString()}`;
    textarea.value = testMessage;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('✅ Texto inserido:', testMessage);
    
    // Verificar se o botão foi habilitado
    setTimeout(() => {
      if (submitButton.disabled) {
        console.log('⚠️ Botão ainda está desabilitado após inserir texto');
      } else {
        console.log('✅ Botão foi habilitado após inserir texto');
      }
      
      // Tentar clicar no botão
      try {
        submitButton.click();
        console.log('✅ Botão clicado');
        
        // Verificar se há mudanças na página
        setTimeout(() => {
          const newValue = textarea.value;
          if (newValue === '') {
            console.log('✅ Textarea foi limpo - mensagem enviada!');
          } else {
            console.log('⚠️ Textarea não foi limpo - mensagem pode não ter sido enviada');
          }
          
          // Verificar se há mensagens na tela
          const allDivs = document.querySelectorAll('div');
          let messageCount = 0;
          
          for (let div of allDivs) {
            const style = window.getComputedStyle(div);
            if (style.marginBottom === '15px' && 
                style.padding === '15px' && 
                style.borderRadius === '8px') {
              messageCount++;
            }
          }
          
          console.log('📊 Mensagens visíveis na tela:', messageCount);
          
        }, 2000);
        
      } catch (clickError) {
        console.error('❌ Erro ao clicar no botão:', clickError);
      }
      
    }, 500);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar teste
testarEnvioDireto();
