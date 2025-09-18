// Script para verificar por que o botão está sendo desabilitado
// Execute este script no console do navegador na página /chat

console.log('🔍 VERIFICANDO POR QUE O BOTÃO ESTÁ DESABILITADO');
console.log('==============================================');

const verificarPorqueBotaoDesabilitado = async () => {
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
    console.log('ID do botão:', submitButton.id);
    console.log('Nome do botão:', submitButton.name);
    
    // Verificar se há texto no textarea
    console.log('Texto no textarea:', textarea.value);
    console.log('Textarea vazio:', textarea.value.trim() === '');
    console.log('Comprimento do texto:', textarea.value.length);
    console.log('MaxLength do textarea:', textarea.maxLength);
    console.log('MinLength do textarea:', textarea.minLength);

    // 4. Verificar se há JavaScript que está desabilitando o botão
    console.log('\n4️⃣ VERIFICANDO JAVASCRIPT QUE DESABILITA O BOTÃO');
    
    // Verificar se há event listeners no textarea
    console.log('Event listeners no textarea:', textarea.onInput ? 'Sim' : 'Não');
    console.log('Event listeners no textarea (onChange):', textarea.onChange ? 'Sim' : 'Não');
    console.log('Event listeners no textarea (onKeyup):', textarea.onKeyup ? 'Sim' : 'Não');
    
    // Verificar se há event listeners no formulário
    console.log('Event listeners no formulário:', form.onSubmit ? 'Sim' : 'Não');
    console.log('Event listeners no formulário (onChange):', form.onChange ? 'Sim' : 'Não');
    
    // Verificar se há event listeners no botão
    console.log('Event listeners no botão:', submitButton.onClick ? 'Sim' : 'Não');
    console.log('Event listeners no botão (onMouseDown):', submitButton.onMouseDown ? 'Sim' : 'Não');

    // 5. Verificar se há elementos de validação
    console.log('\n5️⃣ VERIFICANDO ELEMENTOS DE VALIDAÇÃO');
    
    // Verificar se há elementos de validação HTML5
    console.log('Textarea required:', textarea.required);
    console.log('Textarea pattern:', textarea.pattern);
    console.log('Textarea minLength:', textarea.minLength);
    console.log('Textarea maxLength:', textarea.maxLength);
    
    // Verificar se há elementos de validação customizada
    const validationElements = document.querySelectorAll('[class*="valid"], [class*="invalid"], [class*="error"], [class*="required"]');
    console.log('Elementos de validação:', validationElements.length);
    
    if (validationElements.length > 0) {
      console.log('Elementos de validação encontrados:');
      validationElements.slice(0, 3).forEach((el, i) => {
        console.log(`${i + 1}.`, el.tagName, el.className || 'sem classe', el.textContent?.substring(0, 50));
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

    // 8. Verificar se há elementos de contexto de autenticação
    console.log('\n8️⃣ VERIFICANDO CONTEXTO DE AUTENTICAÇÃO');
    
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

    // 9. Verificar se há elementos de navbar
    console.log('\n9️⃣ VERIFICANDO NAVBAR');
    
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

    // 10. Resumo final
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
    } else {
      console.log('✅ Usuário está logado e página carregou');
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
verificarPorqueBotaoDesabilitado();
