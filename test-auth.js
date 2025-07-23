// Script de teste para verificar autenticação
// Execute este script no console do navegador quando estiver logado

async function testAuth() {
  try {
    console.log('=== TESTE DE AUTENTICAÇÃO ===');
    
    // 1. Verificar se o supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está disponível');
      return;
    }
    console.log('✅ Supabase disponível');

    // 2. Obter a sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      return;
    }

    if (!session) {
      console.error('❌ Nenhuma sessão encontrada - faça login primeiro');
      return;
    }

    console.log('✅ Sessão encontrada');
    console.log('👤 User ID:', session.user.id);
    console.log('📧 Email:', session.user.email);
    console.log('🔑 Token existe:', !!session.access_token);
    console.log('🔑 Token length:', session.access_token?.length || 0);

    // 3. Testar a Edge Function
    console.log('\n=== TESTE DA EDGE FUNCTION ===');
    
    const response = await fetch(
      'https://mbxefiadqcrzqbrfkvxu.supabase.co/functions/v1/welcome-email',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Status Text:', response.statusText);

    const data = await response.json();
    console.log('📄 Dados da resposta:', data);

    if (response.ok) {
      console.log('✅ Sucesso! Email enviado.');
    } else {
      console.log('❌ Erro na resposta:', data.error);
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar o teste
testAuth(); 