// Script para testar o sistema de chat público (mensagens para todos)
// Execute este script no console do navegador

console.log('🧪 Testando sistema de chat público...');

// Função para testar envio de mensagem pública
const testarEnvioMensagemPublica = async () => {
  try {
    console.log('📝 Testando envio de mensagem pública...');
    
    // Verificar se o usuário está logado
    if (!window.supabase) {
      console.error('❌ Supabase não está disponível');
      return;
    }

    // Buscar dados do usuário atual
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Usuário não logado:', userError);
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
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }

    console.log('✅ Perfil encontrado:', profile);

    // Dados da mensagem de teste
    const messageData = {
      user_id: user.id,
      username: profile?.username || 'Usuário Teste',
      avatar_url: profile?.avatar_url || 'avatar_1.png',
      message: `🧪 Mensagem de teste - ${new Date().toLocaleString()}`,
      message_type: 'encouragement',
      created_at: new Date().toISOString()
    };

    console.log('📤 Enviando mensagem:', messageData);

    // Tentar inserir mensagem
    const { data, error } = await window.supabase
      .from('chat_ev_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      console.error('Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return;
    }

    console.log('✅ Mensagem enviada com sucesso:', data);
    
    // Verificar se a mensagem aparece na lista
    setTimeout(async () => {
      const { data: messages, error: loadError } = await window.supabase
        .from('chat_ev_messages')
        .select('*')
        .eq('id', data.id)
        .single();

      if (loadError) {
        console.error('❌ Erro ao verificar mensagem:', loadError);
      } else {
        console.log('✅ Mensagem confirmada na base de dados:', messages);
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
};

// Função para verificar estrutura da tabela
const verificarEstruturaTabela = async () => {
  try {
    console.log('🔍 Verificando estrutura da tabela...');
    
    // Tentar buscar uma mensagem para verificar se a tabela existe
    const { data, error } = await window.supabase
      .from('chat_ev_messages')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao acessar tabela chat_ev_messages:', error);
      return;
    }

    console.log('✅ Tabela chat_ev_messages acessível');
    console.log('📊 Estrutura da primeira mensagem:', data[0] || 'Nenhuma mensagem encontrada');

  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  }
};

// Função para testar Realtime
const testarRealtime = async () => {
  try {
    console.log('📡 Testando conexão Realtime...');
    
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
          console.log('🔔 Nova mensagem detectada via Realtime:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do canal Realtime:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal Realtime conectado com sucesso');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro no canal Realtime');
        }
      });

    // Desconectar após 5 segundos
    setTimeout(() => {
      window.supabase.removeChannel(channel);
      console.log('🔌 Canal de teste desconectado');
    }, 5000);

  } catch (error) {
    console.error('❌ Erro ao testar Realtime:', error);
  }
};

// Executar todos os testes
const executarTestes = async () => {
  console.log('🚀 Iniciando testes do chat público...');
  
  await verificarEstruturaTabela();
  await testarRealtime();
  await testarEnvioMensagemPublica();
  
  console.log('🎯 Testes concluídos! Verifique os resultados acima.');
};

// Executar testes
executarTestes();
