// Script detalhado para testar o chat público
// Execute este script no console do navegador

console.log('🧪 Teste detalhado do chat público...');

// Função principal de teste
const testarChatPublico = async () => {
  try {
    // Verificar se supabase está disponível
    if (!window.supabase) {
      console.error('❌ Supabase não está disponível');
      return;
    }

    // Verificar se usuário está logado
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Usuário não logado:', userError);
      return;
    }

    console.log('✅ Usuário logado:', user.email);
    console.log('🆔 User ID:', user.id);

    // Teste 1: Verificar se a tabela existe e é acessível
    console.log('\n1️⃣ Testando acesso à tabela chat_ev_messages...');
    
    const { data: tableTest, error: tableError } = await window.supabase
      .from('chat_ev_messages')
      .select('id, user_id, username, message, message_type, created_at')
      .limit(5);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError);
      console.log('💡 Código do erro:', tableError.code);
      console.log('💡 Mensagem:', tableError.message);
      console.log('💡 Detalhes:', tableError.details);
      console.log('💡 Hint:', tableError.hint);
      return;
    }

    console.log('✅ Tabela acessível');
    console.log('📊 Mensagens encontradas:', tableTest.length);
    if (tableTest.length > 0) {
      console.log('📝 Última mensagem:', tableTest[tableTest.length - 1]);
    }

    // Teste 2: Verificar perfil do usuário
    console.log('\n2️⃣ Testando perfil do usuário...');
    
    const { data: profile, error: profileError } = await window.supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      console.log('💡 Código do erro:', profileError.code);
      console.log('💡 Mensagem:', profileError.message);
      return;
    }

    if (!profile) {
      console.error('❌ Perfil não encontrado');
      return;
    }

    console.log('✅ Perfil encontrado:', profile.username);
    console.log('🖼️ Avatar:', profile.avatar_url);

    // Teste 3: Verificar estrutura da tabela
    console.log('\n3️⃣ Verificando estrutura da tabela...');
    
    const { data: structureTest, error: structureError } = await window.supabase
      .from('chat_ev_messages')
      .select('*')
      .limit(1);

    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError);
    } else {
      console.log('✅ Estrutura da tabela OK');
      if (structureTest.length > 0) {
        console.log('📋 Colunas disponíveis:', Object.keys(structureTest[0]));
      }
    }

    // Teste 4: Tentar enviar mensagem de teste
    console.log('\n4️⃣ Testando envio de mensagem...');
    
    const messageData = {
      user_id: user.id,
      username: profile.username,
      avatar_url: profile.avatar_url || 'avatar_1.png',
      message: `🧪 Teste detalhado ${new Date().toLocaleTimeString()}`,
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
      console.error('❌ Erro ao enviar mensagem:', messageError);
      console.log('💡 Código do erro:', messageError.code);
      console.log('💡 Mensagem:', messageError.message);
      console.log('💡 Detalhes:', messageError.details);
      console.log('💡 Hint:', messageError.hint);
      return;
    }

    console.log('✅ Mensagem enviada com sucesso!');
    console.log('📝 ID da mensagem:', messageResult.id);
    console.log('📝 Mensagem completa:', messageResult);

    // Teste 5: Verificar se a mensagem aparece na lista
    console.log('\n5️⃣ Verificando se a mensagem aparece na lista...');
    
    const { data: messages, error: messagesError } = await window.supabase
      .from('chat_ev_messages')
      .select('*')
      .eq('id', messageResult.id)
      .single();

    if (messagesError) {
      console.error('❌ Erro ao verificar mensagem:', messagesError);
    } else {
      console.log('✅ Mensagem confirmada na base de dados');
      console.log('📝 Mensagem encontrada:', messages);
    }

    // Teste 6: Verificar Realtime
    console.log('\n6️⃣ Testando Realtime...');
    
    const channel = window.supabase
      .channel('test_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_ev_messages'
        },
        (payload) => {
          console.log('📡 Realtime funcionando! Nova mensagem:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do Realtime:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime conectado com sucesso');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Erro no canal Realtime');
        }
      });

    // Aguardar um pouco e depois limpar
    setTimeout(() => {
      window.supabase.removeChannel(channel);
      console.log('🧹 Canal Realtime removido');
    }, 5000);

    console.log('\n🎉 Todos os testes passaram! Chat público funcionando.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Stack trace:', error.stack);
  }
};

// Executar teste
testarChatPublico();
