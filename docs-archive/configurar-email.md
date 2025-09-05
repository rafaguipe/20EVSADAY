# 📧 Configurar Envio de Email - EVSADAY

## 🎯 Situação Atual

✅ **Edge Function funcionando** - A função está sendo executada com sucesso
❌ **Email não sendo enviado** - Falta configurar um serviço de email

## 🚀 Opções para Envio de Email

### **Opção 1: Resend (Recomendado)**

#### **1. Criar conta no Resend:**
1. **Acesse**: https://resend.com
2. **Crie uma conta gratuita**
3. **Verifique seu email**

#### **2. Obter API Key:**
1. **Dashboard** → API Keys
2. **Create API Key**
3. **Copie** a chave (começa com `re_`)

#### **3. Configurar no Supabase:**
1. **Dashboard** → Edge Functions → Secrets
2. **Adicionar**:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_sua_chave_aqui`

#### **4. Configurar Domínio (Opcional):**
1. **Resend Dashboard** → Domains
2. **Add Domain** → `evsaday.com`
3. **Configurar DNS** conforme instruções

### **Opção 2: SendGrid (Alternativo)**

#### **1. Criar conta no SendGrid:**
1. **Acesse**: https://sendgrid.com
2. **Crie uma conta gratuita** (100 emails/dia)

#### **2. Obter API Key:**
1. **Dashboard** → Settings → API Keys
2. **Create API Key**
3. **Copie** a chave

#### **3. Modificar Edge Function:**
Substituir a função `sendWelcomeEmail` por:

```typescript
async function sendWelcomeEmail(email, username, htmlContent) {
  try {
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    
    if (!sendgridApiKey) {
      console.log('SENDGRID_API_KEY not configured')
      return true
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }]
        }],
        from: { email: 'noreply@evsaday.com', name: 'EVSADAY' },
        subject: `🎮 Bem-vindo ao EVSADAY, ${username}!`,
        content: [{
          type: 'text/html',
          value: htmlContent
        }]
      }),
    })

    if (response.ok) {
      console.log('Welcome email sent successfully to:', email)
      return true
    } else {
      const error = await response.text()
      console.error('Failed to send welcome email:', error)
      return false
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}
```

### **Opção 3: EmailJS (Frontend)**

#### **1. Criar conta no EmailJS:**
1. **Acesse**: https://www.emailjs.com
2. **Crie uma conta gratuita**

#### **2. Configurar Template:**
1. **Dashboard** → Email Templates
2. **Criar template** com HTML personalizado
3. **Configurar** variáveis: `{{username}}`, `{{email}}`

#### **3. Obter Credenciais:**
1. **Dashboard** → Account → API Keys
2. **Copie** Service ID, Template ID, User ID

#### **4. Modificar Frontend:**
Adicionar no componente de teste:

```javascript
import emailjs from '@emailjs/browser';

const sendEmailViaEmailJS = async (email, username) => {
  try {
    const result = await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: email,
        username: username,
        message: 'Bem-vindo ao EVSADAY!'
      },
      'YOUR_USER_ID'
    );
    
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};
```

## 🧪 Teste Atual (Simulação)

### **O que está acontecendo agora:**
1. ✅ **Função executada** com sucesso
2. ✅ **Logs salvos** no banco de dados
3. ✅ **Simulação** de envio no console
4. ❌ **Email real** não enviado

### **Verificar Logs:**
Execute no Supabase SQL Editor:
```sql
SELECT * FROM welcome_email_logs ORDER BY sent_at DESC LIMIT 5;
```

## 🎯 Recomendação

### **Para Produção:**
1. **Use Resend** (mais simples e confiável)
2. **Configure domínio** próprio
3. **Monitore** logs de entrega

### **Para Teste:**
1. **Use EmailJS** (envio via frontend)
2. **Configure template** personalizado
3. **Teste** com emails reais

## 📊 Monitoramento

### **Verificar Status:**
```sql
-- Logs de email
SELECT 
  username,
  email,
  sent_at,
  status,
  error_message
FROM welcome_email_logs 
ORDER BY sent_at DESC;

-- Estatísticas
SELECT * FROM welcome_email_statistics;
```

### **Logs da Edge Function:**
1. **Dashboard** → Edge Functions → welcome-email
2. **Aba** → Logs
3. **Verificar** mensagens de console

---

**Status**: ⚠️ Aguardando configuração de serviço de email
**Próximo**: Escolher e configurar serviço de email
**Responsável**: Você (rafaguipe) 