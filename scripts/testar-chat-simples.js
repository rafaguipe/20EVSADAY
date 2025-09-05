// Script simples para testar o chat público
// Execute este script no console do navegador

console.log('🧪 Teste simples do chat público...');

// Teste 1: Verificar se a tabela existe
const testarTabela = async () => {
  try {
    console.log('1️⃣ Testando acesso à tabela...');
    
    const { data, error } = await window.supabase
      .from('chat_ev_messages')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao acessar tabela:', error);
      return false;
    }
    
    console.log('✅ Tabela acessível');
    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
};

// Teste 2: Verificar perfil do usuário
const testarPerfil = async () => {
  try {
    console.log('2️⃣ Testando perfil do usuário...');
    
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Usuário não logado');
      return false;
    }
    
    const { data: profile, error } = await window.supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      return false;
    }
    
    console.log('✅ Perfil encontrado:', profile.username);
    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
};

// Teste 3: Tentar enviar mensagem
const testarEnvio = async () => {
  try {
    console.log('3️⃣ Testando envio de mensagem...');
    
    const { data: { user } } = await window.supabase.auth.getUser();
    const { data: profile } = await window.supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    const messageData = {
      user_id: user.id,
      username: profile?.username || 'Teste',
      message: `🧪 Teste ${new Date().toLocaleTimeString()}`,
      message_type: 'encouragement'
    };

    const { data, error } = await window.supabase
      .from('chat_ev_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao enviar:', error);
      return false;
    }
    
    console.log('✅ Mensagem enviada:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
};

// Executar todos os testes
const executarTestes = async () => {
  console.log('🚀 Iniciando testes...');
  
  const teste1 = await testarTabela();
  const teste2 = await testarPerfil();
  const teste3 = await testarEnvio();
  
  console.log('📊 Resultados:');
  console.log(`Tabela: ${teste1 ? '✅' : '❌'}`);
  console.log(`Perfil: ${teste2 ? '✅' : '❌'}`);
  console.log(`Envio: ${teste3 ? '✅' : '❌'}`);
  
  if (teste1 && teste2 && teste3) {
    console.log('🎉 Todos os testes passaram! Chat público funcionando.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os erros acima.');
  }
};

// Executar
executarTestes();
