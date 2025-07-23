// Script de teste para Edge Function welcome-email
// Execute este script no console do navegador quando estiver logado

async function testWelcomeEmail() {
  try {
    // Obter a sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Erro: Sessão não encontrada');
      return;
    }

    console.log('Sessão encontrada:', !!session);
    console.log('User ID:', session.user.id);

    // Fazer a requisição para a Edge Function
    const response = await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/welcome-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Dados da resposta:', data);

    if (response.ok) {
      console.log('✅ Sucesso! Email enviado.');
    } else {
      console.log('❌ Erro:', data.error);
    }

  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar o teste
testWelcomeEmail(); 