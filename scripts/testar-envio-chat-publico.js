// Script para testar especificamente o envio de mensagem no chat público
// Execute este script no console do navegador quando estiver na página /chat

console.log('🧪 TESTE DE ENVIO DE MENSAGEM PÚBLICA');
console.log('====================================');

const testarEnvioChatPublico = async () => {
  try {
    // 1. Verificar se estamos na página correta
    if (!window.location.pathname.includes('/chat')) {
      console.log('❌ Você não está na página do chat');
      console.log('💡 Navegue para /chat primeiro');
      return;
    }
    console.log('✅ Está na página do chat');

    // 2. Verificar se Supabase está disponível
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase não está disponível globalmente');
      console.log('💡 Tentando acessar via elementos da página...');
      
      // Tentar encontrar elementos do chat
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
      
      // 3. Testar envio de mensagem
      console.log('\n🧪 TESTANDO ENVIO DE MENSAGEM');
      
      // Inserir texto de teste
      const testMessage = `🧪 Teste de envio ${new Date().toLocaleTimeString()}`;
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
            console.log('✅ Teste de envio concluído');
            console.log('💡 Verifique se a mensagem apareceu na lista');
          }, 2000);
          
        } catch (clickError) {
          console.error('❌ Erro ao clicar no botão:', clickError);
        }
      }, 1000);
      
    } else {
      console.log('✅ Supabase disponível globalmente');
      
      // 3. Testar com Supabase diretamente
      console.log('\n🧪 TESTANDO COM SUPABASE DIRETO');
      
      // Verificar se usuário está logado
      const { data: { user }, error: userError } = await window.supabase.auth.getUser();
      if (userError || !user) {
        console.log('❌ Usuário não logado:', userError);
        return;
      }
      console.log('✅ Usuário logado:', user.email);
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await window.supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Erro ao buscar perfil:', profileError);
        return;
      }
      
      if (!profile) {
        console.log('❌ Perfil não encontrado');
        return;
      }
      
      console.log('✅ Perfil encontrado:', profile.username);
      
      // Testar inserção de mensagem
      const messageData = {
        user_id: user.id,
        username: profile.username,
        avatar_url: profile.avatar_url || 'avatar_1.png',
        message: `🧪 Teste Supabase direto ${new Date().toLocaleTimeString()}`,
        message_type: 'encouragement',
        created_at: new Date().toISOString()
      };
      
      console.log('📤 Dados da mensagem:', messageData);
      
      const { data: messageResult, error: messageError } = await window.supabase
        .from('chat_ev_messages')
        .insert(messageData)
        .select()
        .single();
      
      if (messageError) {
        console.log('❌ Erro ao enviar mensagem:', messageError);
        console.log('💡 Código do erro:', messageError.code);
        console.log('💡 Mensagem:', messageError.message);
        console.log('💡 Detalhes:', messageError.details);
        console.log('💡 Hint:', messageError.hint);
        return;
      }
      
      console.log('✅ Mensagem enviada com sucesso!');
      console.log('📝 ID da mensagem:', messageResult.id);
      console.log('📝 Mensagem completa:', messageResult);
      
      // Verificar se a mensagem aparece na lista
      const { data: messages, error: messagesError } = await window.supabase
        .from('chat_ev_messages')
        .select('*')
        .eq('id', messageResult.id)
        .single();
      
      if (messagesError) {
        console.log('❌ Erro ao verificar mensagem:', messagesError);
      } else {
        console.log('✅ Mensagem confirmada na base de dados');
        console.log('📝 Mensagem encontrada:', messages);
      }
    }
    
    console.log('\n🎯 TESTE CONCLUÍDO');
    console.log('==================');
    console.log('💡 Verifique os resultados acima para identificar problemas');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.log('Stack trace:', error.stack);
  }
};

// Executar teste
testarEnvioChatPublico();
