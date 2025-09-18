// Script para verificar especificamente o problema do botão de envio
// Execute este script no console do navegador na página /chat

console.log('🔍 VERIFICANDO BOTÃO DE ENVIO');
console.log('============================');

const verificarBotaoEnvio = async () => {
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
    
    if (!textarea) {
      console.log('❌ Textarea não encontrado');
      return;
    }
    
    if (!form) {
      console.log('❌ Formulário não encontrado');
      return;
    }
    
    if (!submitButton) {
      console.log('❌ Botão de envio não encontrado');
      return;
    }
    
    console.log('✅ Textarea encontrado');
    console.log('✅ Formulário encontrado');
    console.log('✅ Botão de envio encontrado');

    // 3. Verificar propriedades do botão
    console.log('\n3️⃣ VERIFICANDO PROPRIEDADES DO BOTÃO');
    
    console.log('Tipo do botão:', submitButton.type);
    console.log('Texto do botão:', submitButton.textContent || submitButton.innerText);
    console.log('Classe do botão:', submitButton.className);
    console.log('Disabled:', submitButton.disabled);
    console.log('Readonly:', submitButton.readOnly);
    console.log('TabIndex:', submitButton.tabIndex);
    console.log('Style:', submitButton.style.cssText);
    
    // Verificar se o botão está visível
    const computedStyle = window.getComputedStyle(submitButton);
    console.log('Display:', computedStyle.display);
    console.log('Visibility:', computedStyle.visibility);
    console.log('Opacity:', computedStyle.opacity);
    console.log('PointerEvents:', computedStyle.pointerEvents);
    
    // Verificar se o botão está dentro do formulário
    const isInForm = form.contains(submitButton);
    console.log('Botão está dentro do formulário:', isInForm);

    // 4. Verificar propriedades do formulário
    console.log('\n4️⃣ VERIFICANDO PROPRIEDADES DO FORMULÁRIO');
    
    console.log('Action do formulário:', form.action);
    console.log('Method do formulário:', form.method);
    console.log('Enctype do formulário:', form.enctype);
    console.log('Target do formulário:', form.target);
    console.log('Classe do formulário:', form.className);
    
    // Verificar se há event listeners
    console.log('Event listeners no formulário:', form.onSubmit ? 'Sim' : 'Não');
    console.log('Event listeners no botão:', submitButton.onClick ? 'Sim' : 'Não');

    // 5. Verificar propriedades do textarea
    console.log('\n5️⃣ VERIFICANDO PROPRIEDADES DO TEXTAREA');
    
    console.log('Nome do textarea:', textarea.name);
    console.log('ID do textarea:', textarea.id);
    console.log('Classe do textarea:', textarea.className);
    console.log('Placeholder do textarea:', textarea.placeholder);
    console.log('Required:', textarea.required);
    console.log('Disabled:', textarea.disabled);
    console.log('Readonly:', textarea.readOnly);
    console.log('MaxLength:', textarea.maxLength);
    console.log('MinLength:', textarea.minLength);
    
    // Verificar se o textarea está dentro do formulário
    const isTextareaInForm = form.contains(textarea);
    console.log('Textarea está dentro do formulário:', isTextareaInForm);

    // 6. Verificar se há erros JavaScript
    console.log('\n6️⃣ VERIFICANDO ERROS JAVASCRIPT');
    
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

    // 7. Testar envio de mensagem
    console.log('\n7️⃣ TESTANDO ENVIO DE MENSAGEM');
    
    // Inserir texto de teste
    const testMessage = `🧪 Teste botão envio ${new Date().toLocaleTimeString()}`;
    textarea.value = testMessage;
    
    // Disparar eventos
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('✅ Texto inserido:', testMessage);
    
    // Aguardar um pouco e clicar no botão
    setTimeout(() => {
      try {
        submitButton.click();
        console.log('✅ Botão de envio clicado');
        
        // Verificar se há erros após o clique
        setTimeout(() => {
          if (errors.length > 0) {
            console.log('❌ Erros encontrados após envio:');
            errors.forEach(error => console.log(' -', error));
          } else {
            console.log('✅ Nenhum erro encontrado após envio');
          }
          
          if (warnings.length > 0) {
            console.log('⚠️ Avisos encontrados após envio:');
            warnings.forEach(warning => console.log(' -', warning));
          }
          
          // Restaurar console original
          console.error = originalError;
          console.warn = originalWarn;
          
          // Verificar se a mensagem apareceu
          verificarMensagemEnviada();
        }, 3000);
        
      } catch (clickError) {
        console.error('❌ Erro ao clicar no botão:', clickError);
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    console.log('Stack trace:', error.stack);
  }
};

const verificarMensagemEnviada = async () => {
  try {
    console.log('\n8️⃣ VERIFICANDO SE MENSAGEM FOI ENVIADA');
    
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
    console.log('\n🎯 RESUMO DO DIAGNÓSTICO');
    console.log('========================');
    
    if (messageElements.length === 0) {
      console.log('❌ PROBLEMA: Mensagem não foi enviada ou não está sendo exibida');
      console.log('💡 SOLUÇÕES:');
      console.log('1. Verificar se há erros JavaScript no console');
      console.log('2. Verificar se há problemas de conexão com Supabase');
      console.log('3. Verificar se há problemas de permissão');
      console.log('4. Verificar se há problemas de Realtime');
      console.log('5. Recarregar a página (F5)');
    } else {
      console.log('✅ Mensagem foi enviada e está sendo exibida');
      console.log('💡 Se ainda não funciona, verifique:');
      console.log('1. Erros JavaScript no console');
      console.log('2. Problemas de conexão');
      console.log('3. Problemas de permissão');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar mensagem:', error);
  }
};

// Executar diagnóstico
verificarBotaoEnvio();
