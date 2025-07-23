// Verificar Configuração do Supabase Auth
// Execute: node verificar-configuracao-supabase.js

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://mbxefiadqcrzqbrfkvxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieGVmaWFkcXJ6cWJyZmt2eHUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDU5NzI5MCwiZXhwIjoyMDUwMTczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarConfiguracao() {
  console.log('🔍 Verificando configuração do Supabase Auth...\n');

  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError);
      return;
    }
    console.log('✅ Conexão com Supabase OK\n');

    // 2. Verificar configurações de auth
    console.log('2️⃣ Verificando configurações de autenticação...');
    
    // Tentar criar um usuário de teste
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 Tentando registrar usuário de teste: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nickname: 'TestUser',
          avatar_id: 1
        }
      }
    });

    if (signUpError) {
      console.error('❌ Erro no registro:', signUpError);
      
      if (signUpError.message.includes('email')) {
        console.log('💡 Possível problema: Configuração de email não está funcionando');
        console.log('🔧 Solução: Configure SMTP no Supabase Dashboard');
      }
    } else {
      console.log('✅ Registro de teste criado com sucesso!');
      console.log('📧 User ID:', signUpData.user?.id);
      console.log('📧 Email confirmado:', signUpData.user?.email_confirmed_at);
      
      if (!signUpData.user?.email_confirmed_at) {
        console.log('⚠️ Email não foi confirmado automaticamente');
        console.log('💡 Isso pode indicar problema na configuração de email');
      }
    }

    // 3. Verificar se há usuários não confirmados
    console.log('\n3️⃣ Verificando usuários não confirmados...');
    
    // Nota: Não podemos listar usuários diretamente, mas podemos verificar logs
    console.log('📊 Para ver logs de autenticação:');
    console.log('   - Acesse: https://supabase.com/dashboard/project/mbxefiadqcrzqbrfkvxu/logs');
    console.log('   - Filtre por "auth" para ver logs de autenticação');

    // 4. Verificar configurações de email
    console.log('\n4️⃣ Verificando configurações de email...');
    console.log('📧 Para configurar email no Supabase:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/mbxefiadqcrzqbrfkvxu/auth/settings');
    console.log('   2. Vá para "SMTP Settings"');
    console.log('   3. Configure com Resend:');
    console.log('      - Host: smtp.resend.com');
    console.log('      - Port: 587');
    console.log('      - User: resend');
    console.log('      - Password: re_S5VDWdQn_iUzkwJXv9DtPSQVkZit7ZVMx');
    console.log('      - From: onboarding@resend.dev');

    // 5. Teste de reenvio de confirmação
    console.log('\n5️⃣ Testando reenvio de confirmação...');
    
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail
    });

    if (resendError) {
      console.error('❌ Erro ao reenviar confirmação:', resendError);
    } else {
      console.log('✅ Reenvio de confirmação solicitado');
      console.log('📧 Verifique se o email chegou em:', testEmail);
    }

    // 6. Verificar templates de email
    console.log('\n6️⃣ Verificando templates de email...');
    console.log('📧 Para configurar templates:');
    console.log('   - Acesse: https://supabase.com/dashboard/project/mbxefiadqcrzqbrfkvxu/auth/templates');
    console.log('   - Configure "Confirm signup" template');
    console.log('   - Use HTML personalizado para #20EVSADAY');

    console.log('\n🎯 Resumo das verificações:');
    console.log('✅ Conexão Supabase: OK');
    console.log('📧 Configuração SMTP: Precisa ser verificada no Dashboard');
    console.log('🔧 Próximos passos:');
    console.log('   1. Configure SMTP no Supabase Dashboard');
    console.log('   2. Teste registro de novo usuário');
    console.log('   3. Verifique logs de autenticação');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
verificarConfiguracao(); 