// COPIE TODO ESTE TEXTO E COLE NO CONSOLE DO NAVEGADOR (F12)

console.log('=== TESTE DE EMAIL DE BOAS-VINDAS ===');

// 1. Verificar se está logado
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  console.error('❌ Faça login primeiro!');
} else {
  console.log('✅ Logado como:', session.user.email);
  console.log('👤 User ID:', session.user.id);
  
  // 2. Testar envio de email
  try {
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
    
    console.log('📡 Status:', response.status);
    const data = await response.json();
    console.log('📄 Resposta:', data);
    
    if (response.ok) {
      console.log('✅ SUCESSO! Email enviado para:', session.user.email);
    } else {
      console.log('❌ ERRO:', data.error);
    }
  } catch (error) {
    console.error('💥 Erro:', error.message);
  }
} 