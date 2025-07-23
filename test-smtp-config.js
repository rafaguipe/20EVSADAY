// Teste de Configuração SMTP - Resend
// Execute: node test-smtp-config.js

const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🧪 Testando configuração SMTP do Resend...\n');

  // Configuração do transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: 'resend',
      pass: 're_S5VDWdQn_iUzkwJXv9DtPSQVkZit7ZVMx'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Configuração do email
  const mailOptions = {
    from: 'onboarding@resend.dev',
    to: 'rafaguipe1402@gmail.com',
    subject: '🧪 Teste SMTP #20EVSADAY',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎮 #20EVSADAY</h2>
        <h3>Teste de Configuração SMTP</h3>
        <p>Este é um email de teste para verificar se a configuração SMTP do Resend está funcionando corretamente.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Configurações testadas:</strong>
          <ul>
            <li>Host: smtp.resend.com</li>
            <li>Port: 587</li>
            <li>User: resend</li>
            <li>From: onboarding@resend.dev</li>
          </ul>
        </div>
        <p>Se você recebeu este email, a configuração está funcionando! ✅</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Enviado em: ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    `
  };

  try {
    console.log('📧 Enviando email de teste...');
    
    // Verificar conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso!');
    
    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Resposta do servidor:', info.response);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se a API key do Resend está correta');
    console.log('2. Verifique se o domínio está configurado no Resend');
    console.log('3. Verifique se não há bloqueio de firewall');
    console.log('4. Tente usar porta 465 com SSL');
    
    return false;
  }
}

// Teste alternativo usando API REST do Resend
async function testResendAPI() {
  console.log('\n🌐 Testando API REST do Resend...\n');

  const emailData = {
    from: 'onboarding@resend.dev',
    to: 'rafaguipe1402@gmail.com',
    subject: '🧪 Teste API #20EVSADAY',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎮 #20EVSADAY</h2>
        <h3>Teste de API REST</h3>
        <p>Este é um teste usando a API REST do Resend.</p>
        <p>Se você recebeu este email, a API está funcionando! ✅</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Enviado em: ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    `
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_S5VDWdQn_iUzkwJXv9DtPSQVkZit7ZVMx',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email enviado via API REST!');
      console.log('📧 ID:', result.id);
      return true;
    } else {
      console.error('❌ Erro na API REST:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API REST:', error);
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log('🚀 Iniciando testes de configuração do Resend...\n');
  
  const smtpResult = await testSMTP();
  const apiResult = await testResendAPI();
  
  console.log('\n📊 Resultados dos Testes:');
  console.log('SMTP:', smtpResult ? '✅ Sucesso' : '❌ Falha');
  console.log('API REST:', apiResult ? '✅ Sucesso' : '❌ Falha');
  
  if (smtpResult || apiResult) {
    console.log('\n🎉 Pelo menos um método está funcionando!');
    console.log('💡 Configure o Supabase para usar o método que funcionou.');
  } else {
    console.log('\n⚠️ Nenhum método funcionou. Verifique as configurações.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests();
}

module.exports = { testSMTP, testResendAPI, runTests }; 