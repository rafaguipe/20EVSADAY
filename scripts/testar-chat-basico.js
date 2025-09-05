// Script básico para testar o chat público
// Execute este script no console do navegador

console.log('🧪 Teste básico do chat público...');

// Função principal de teste
const testarChat = async () => {
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

    // Teste 1: Verificar se a tabela existe
    console.log('1️⃣ Testando acesso à tabela...');
    
    const { data: tableTest, error: tableError } = await window.supabase
      .from('chat_ev_messages')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError);
      console.log('💡 Possíveis soluções:');
      console.log('   - Tabela não existe');
      console.log('   - Políticas RLS muito restritivas');
      console.log('   - Usuário sem permissão');
      return;
    }

    console.log('✅ Tabela acessível');

    // Teste 2: Verificar perfil
    console.log('2️⃣ Testando perfil do usuário...');
    
    const { data: profile, error: profileError } = await window.supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      console.log('💡 Solução: Criar perfil do usuário');
      return;
    }

    console.log('✅ Perfil encontrado:', profile.username);

    // Teste 3: Enviar mensagem
    console.log('3️⃣ Testando envio de mensagem...');
    
    const messageData = {
      user_id: user.id,
      username: profile.username,
      message: `🧪 Teste ${new Date().toLocaleTimeString()}`,
      message_type: 'encouragement'
    };

    const { data: messageResult, error: messageError } = await window.supabase
      .from('chat_ev_messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      console.error('❌ Erro ao enviar mensagem:', messageError);
      console.log('💡 Possíveis soluções:');
      console.log('   - Verificar políticas RLS');
      console.log('   - Verificar permissões do usuário');
      console.log('   - Verificar estrutura da tabela');
      return;
    }

    console.log('✅ Mensagem enviada com sucesso!');
    console.log('📝 ID da mensagem:', messageResult.id);

    // Teste 4: Verificar se a mensagem aparece
    console.log('4️⃣ Verificando se a mensagem aparece na lista...');
    
    const { data: messages, error: messagesError } = await window.supabase
      .from('chat_ev_messages')
      .select('*')
      .eq('id', messageResult.id)
      .single();

    if (messagesError) {
      console.error('❌ Erro ao verificar mensagem:', messagesError);
    } else {
      console.log('✅ Mensagem confirmada na base de dados');
    }

    console.log('🎉 Todos os testes passaram! Chat público funcionando.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
};

// Executar teste
testarChat();
