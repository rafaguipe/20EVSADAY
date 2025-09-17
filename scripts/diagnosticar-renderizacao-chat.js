// Script para diagnosticar problemas de renderização do chat
// Execute este script no console do navegador

console.log('🔍 Diagnosticando renderização do chat...');

// Função para diagnosticar renderização
const diagnosticarRenderizacao = () => {
  try {
    // Verificar se estamos na página do chat
    if (!window.location.pathname.includes('/chat')) {
      console.log('⚠️ Você não está na página do chat');
      return;
    }
    
    console.log('✅ Está na página do chat');
    
    // Verificar se há erros no console
    const originalError = console.error;
    const errors = [];
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Verificar se há elementos React
    const reactElements = document.querySelectorAll('[data-reactroot]') || 
                        document.querySelectorAll('div[data-reactroot]');
    
    if (reactElements.length > 0) {
      console.log('✅ Elementos React encontrados:', reactElements.length);
    } else {
      console.log('⚠️ Elementos React não encontrados');
    }
    
    // Verificar se há elementos com estilos inline
    const allDivs = document.querySelectorAll('div');
    let styledElements = 0;
    let chatElements = 0;
    
    for (let div of allDivs) {
      const style = window.getComputedStyle(div);
      
      // Verificar se tem estilos específicos do chat
      if (style.backgroundColor === 'rgb(26, 26, 26)' || 
          style.backgroundColor === 'rgb(42, 42, 42)') {
        styledElements++;
        
        // Verificar se é container de chat
        if (style.maxWidth === '800px' && style.margin === '0px auto') {
          chatElements++;
          console.log('✅ Container de chat encontrado:', div);
        }
      }
    }
    
    console.log('📊 Elementos com estilos do chat:', styledElements);
    console.log('📊 Containers de chat:', chatElements);
    
    // Verificar se há elementos de carregamento
    const loadingElements = document.querySelectorAll('div');
    let loadingCount = 0;
    
    for (let div of loadingElements) {
      const text = div.textContent || div.innerText;
      if (text.includes('Carregando') || text.includes('Loading')) {
        loadingCount++;
        console.log('⏳ Elemento de carregamento encontrado:', div);
      }
    }
    
    console.log('📊 Elementos de carregamento:', loadingCount);
    
    // Verificar se há elementos de erro
    const errorElements = document.querySelectorAll('div');
    let errorCount = 0;
    
    for (let div of errorElements) {
      const text = div.textContent || div.innerText;
      if (text.includes('Erro') || text.includes('Error')) {
        errorCount++;
        console.log('❌ Elemento de erro encontrado:', div);
      }
    }
    
    console.log('📊 Elementos de erro:', errorCount);
    
    // Verificar se há elementos vazios
    const emptyElements = document.querySelectorAll('div');
    let emptyCount = 0;
    
    for (let div of emptyElements) {
      const text = div.textContent || div.innerText;
      if (text.includes('Seja o primeiro') || text.includes('experiência')) {
        emptyCount++;
        console.log('📝 Elemento vazio encontrado:', div);
      }
    }
    
    console.log('📊 Elementos vazios:', emptyCount);
    
    // Verificar se há formulários
    const forms = document.querySelectorAll('form');
    console.log('📊 Formulários encontrados:', forms.length);
    
    for (let form of forms) {
      const style = window.getComputedStyle(form);
      console.log('📝 Formulário:', {
        backgroundColor: style.backgroundColor,
        padding: style.padding,
        borderRadius: style.borderRadius
      });
    }
    
    // Verificar se há textareas
    const textareas = document.querySelectorAll('textarea');
    console.log('📊 Textareas encontrados:', textareas.length);
    
    for (let textarea of textareas) {
      const style = window.getComputedStyle(textarea);
      console.log('📝 Textarea:', {
        backgroundColor: style.backgroundColor,
        border: style.border,
        padding: style.padding
      });
    }
    
    // Verificar se há botões
    const buttons = document.querySelectorAll('button');
    console.log('📊 Botões encontrados:', buttons.length);
    
    for (let button of buttons) {
      const text = button.textContent || button.innerText;
      if (text.includes('Enviar') || text.includes('📤')) {
        console.log('📝 Botão de envio encontrado:', {
          text: text,
          disabled: button.disabled,
          style: window.getComputedStyle(button).backgroundColor
        });
      }
    }
    
    // Verificar se há erros no console
    if (errors.length > 0) {
      console.log('❌ Erros encontrados no console:');
      errors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ Nenhum erro encontrado no console');
    }
    
    // Restaurar console.error original
    console.error = originalError;
    
    // Verificar se há problemas de CSS
    const stylesheets = document.styleSheets;
    console.log('📊 Stylesheets carregados:', stylesheets.length);
    
    // Verificar se há problemas de JavaScript
    const scripts = document.scripts;
    console.log('📊 Scripts carregados:', scripts.length);
    
    console.log('\n🎉 Diagnóstico concluído!');
    
    if (chatElements === 0) {
      console.log('❌ PROBLEMA: Container de chat não está sendo renderizado');
      console.log('💡 Possíveis causas:');
      console.log('   - Erro de sintaxe no componente ChatEV');
      console.log('   - Problema de carregamento do React');
      console.log('   - Erro de CSS que impede renderização');
      console.log('   - Problema de autenticação');
    } else {
      console.log('✅ Container de chat está sendo renderizado');
    }
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
};

// Executar diagnóstico
diagnosticarRenderizacao();
