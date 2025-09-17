// Script para verificar se você está na página correta do chat
// Execute este script no console do navegador

console.log('🔍 Verificando página do chat...');

// Função para verificar a página
const verificarPaginaChat = () => {
  try {
    // Verificar URL
    console.log('📍 URL atual:', window.location.href);
    console.log('📍 Pathname:', window.location.pathname);
    
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      console.log('💡 Navegue para /chat primeiro');
      return;
    }
    
    console.log('✅ Está na página do chat');
    
    // Verificar se há elementos básicos
    console.log('\n🔍 Verificando elementos básicos...');
    
    const allDivs = document.querySelectorAll('div');
    console.log('📊 Total de divs na página:', allDivs.length);
    
    const allForms = document.querySelectorAll('form');
    console.log('📊 Total de formulários na página:', allForms.length);
    
    const allTextareas = document.querySelectorAll('textarea');
    console.log('📊 Total de textareas na página:', allTextareas.length);
    
    const allButtons = document.querySelectorAll('button');
    console.log('📊 Total de botões na página:', allButtons.length);
    
    // Procurar por elementos com estilos específicos
    let chatElements = 0;
    let messageElements = 0;
    let formElements = 0;
    
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      
      // Procurar container principal (background: #1a1a1a)
      if (style.backgroundColor === 'rgb(26, 26, 26)' && 
          style.maxWidth === '800px') {
        chatElements++;
      }
      
      // Procurar container de mensagens (background: #2a2a2a)
      if (style.backgroundColor === 'rgb(42, 42, 42)' && 
          style.height === '500px') {
        messageElements++;
      }
      
      // Procurar formulário (background: #2a2a2a com padding: 20px)
      if (style.backgroundColor === 'rgb(42, 42, 42)' && 
          style.padding === '20px') {
        formElements++;
      }
    }
    
    console.log('\n🎯 Elementos específicos encontrados:');
    console.log('📦 Containers de chat:', chatElements);
    console.log('💬 Containers de mensagens:', messageElements);
    console.log('📝 Formulários:', formElements);
    
    // Verificar se há texto específico do chat
    const bodyText = document.body.textContent || document.body.innerText;
    
    if (bodyText.includes('Chat EV')) {
      console.log('✅ Título "Chat EV" encontrado');
    } else {
      console.log('❌ Título "Chat EV" não encontrado');
    }
    
    if (bodyText.includes('Estados Vibracionais')) {
      console.log('✅ Texto "Estados Vibracionais" encontrado');
    } else {
      console.log('❌ Texto "Estados Vibracionais" não encontrado');
    }
    
    if (bodyText.includes('Regras do Chat')) {
      console.log('✅ Seção "Regras do Chat" encontrada');
    } else {
      console.log('❌ Seção "Regras do Chat" não encontrada');
    }
    
    // Verificar se há elementos de carregamento
    if (bodyText.includes('Carregando')) {
      console.log('⏳ Chat ainda carregando...');
    }
    
    // Verificar se há estado vazio
    if (bodyText.includes('Seja o primeiro') || bodyText.includes('experiência')) {
      console.log('📝 Chat vazio - nenhuma mensagem ainda');
    }
    
    // Verificar se há erros visíveis
    if (bodyText.includes('Erro') || bodyText.includes('error')) {
      console.log('❌ Possíveis erros visíveis na página');
    }
    
    console.log('\n🎉 Verificação concluída!');
    
    if (chatElements > 0 && messageElements > 0 && formElements > 0) {
      console.log('✅ Página do chat parece estar funcionando corretamente');
      console.log('💡 Agora execute o script de teste de envio de mensagem');
    } else {
      console.log('⚠️ Alguns elementos do chat não foram encontrados');
      console.log('💡 Verifique se a página carregou completamente');
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
};

// Executar verificação
verificarPaginaChat();
