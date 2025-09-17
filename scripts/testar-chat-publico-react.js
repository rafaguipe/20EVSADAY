// Script para testar o chat público usando o contexto React
// Execute este script no console do navegador

console.log('🧪 Teste do chat público usando contexto React...');

// Função para acessar o Supabase através do contexto React
const getSupabaseFromReact = () => {
  try {
    // Tentar acessar através do React DevTools
    const reactRoot = document.querySelector('#root')._reactInternalFiber || 
                     document.querySelector('#root')._reactInternalInstance;
    
    if (reactRoot) {
      console.log('✅ React root encontrado');
      return null; // Continuaremos com método alternativo
    }
  } catch (error) {
    console.log('⚠️ Não foi possível acessar React root:', error.message);
  }
  
  return null;
};

// Função principal de teste usando método alternativo
const testarChatPublicoReact = async () => {
  try {
    // Método 1: Tentar acessar através de variáveis globais
    console.log('1️⃣ Tentando acessar Supabase através de variáveis globais...');
    
    // Verificar se há alguma referência global ao Supabase
    const possibleSupabase = window.supabase || 
                            window.__SUPABASE__ || 
                            window.supabaseClient ||
                            window.reactApp?.supabase;
    
    if (possibleSupabase) {
      console.log('✅ Supabase encontrado globalmente:', possibleSupabase);
      await testarComSupabase(possibleSupabase);
      return;
    }
    
    console.log('❌ Supabase não encontrado globalmente');
    
    // Método 2: Tentar criar uma instância do Supabase
    console.log('\n2️⃣ Tentando criar instância do Supabase...');
    
    // Verificar se as variáveis de ambiente estão disponíveis
    const supabaseUrl = process.env?.REACT_APP_SUPABASE_URL || 
                       window.REACT_APP_SUPABASE_URL ||
                       'https://mbxefiadqcrzqbrfkvxu.supabase.co';
    
    const supabaseKey = process.env?.REACT_APP_SUPABASE_ANON_KEY || 
                       window.REACT_APP_SUPABASE_ANON_KEY ||
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieGVmaWFkcWNyenFicmZrdnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K';
    
    console.log('🔗 URL do Supabase:', supabaseUrl);
    console.log('🔑 Chave encontrada:', supabaseKey ? 'Sim' : 'Não');
    
    if (!supabaseKey || supabaseKey.includes('8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K')) {
      console.log('❌ Chave do Supabase não configurada corretamente');
      console.log('💡 Solução: Configure as variáveis de ambiente REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY');
      return;
    }
    
    // Tentar importar dinamicamente o Supabase
    try {
      const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      console.log('✅ Cliente Supabase criado com sucesso');
      await testarComSupabase(supabase);
    } catch (importError) {
      console.log('❌ Erro ao importar Supabase:', importError.message);
      
      // Método 3: Usar fetch direto para testar a API
      console.log('\n3️⃣ Testando API diretamente com fetch...');
      await testarComFetch(supabaseUrl, supabaseKey);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Stack trace:', error.stack);
  }
};

// Função para testar com Supabase
const testarComSupabase = async (supabase) => {
  try {
    // Verificar se usuário está logado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Usuário não logado:', userError);
      return;
    }

    console.log('✅ Usuário logado:', user.email);
    console.log('🆔 User ID:', user.id);

    // Teste 1: Verificar se a tabela existe e é acessível
    console.log('\n1️⃣ Testando acesso à tabela chat_ev_messages...');
    
    const { data: tableTest, error: tableError } = await supabase
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
    
    const { data: profile, error: profileError } = await supabase
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

    // Teste 3: Tentar enviar mensagem de teste
    console.log('\n3️⃣ Testando envio de mensagem...');
    
    const messageData = {
      user_id: user.id,
      username: profile.username,
      avatar_url: profile.avatar_url || 'avatar_1.png',
      message: `🧪 Teste React ${new Date().toLocaleTimeString()}`,
      message_type: 'encouragement',
      created_at: new Date().toISOString()
    };

    console.log('📤 Dados da mensagem:', messageData);

    const { data: messageResult, error: messageError } = await supabase
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

    console.log('\n🎉 Chat público funcionando com Supabase!');

  } catch (error) {
    console.error('❌ Erro no teste com Supabase:', error);
  }
};

// Função para testar com fetch direto
const testarComFetch = async (supabaseUrl, supabaseKey) => {
  try {
    console.log('🔍 Testando API REST diretamente...');
    
    // Teste 1: Verificar se a API está acessível
    const response = await fetch(`${supabaseUrl}/rest/v1/chat_ev_messages?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Erro na API:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('💡 Detalhes do erro:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API REST acessível');
    console.log('📊 Dados recebidos:', data);
    
    // Teste 2: Verificar autenticação
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!authResponse.ok) {
      console.log('⚠️ Usuário não autenticado via API REST');
      console.log('💡 Isso é normal se você não estiver logado');
    } else {
      const authData = await authResponse.json();
      console.log('✅ Usuário autenticado via API REST:', authData.email);
    }
    
    console.log('\n🎉 API REST funcionando!');
    
  } catch (error) {
    console.error('❌ Erro no teste com fetch:', error);
  }
};

// Executar teste
testarChatPublicoReact();
