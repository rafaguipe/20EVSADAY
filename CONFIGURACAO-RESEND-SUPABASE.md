# 📧 Configuração do Resend no Supabase Auth

## 🎯 Objetivo
Configurar o Resend.com como provedor de email do Supabase para resolver o erro 404 na validação de email.

## 🔧 Passo a Passo

### **1. Acessar Supabase Dashboard**
- **URL**: https://supabase.com/dashboard/project/mbxefiadqcrzqbrfkvxu
- **Navegue para**: Authentication → Email Templates

### **2. Configurar SMTP Settings**

#### **2.1 Acessar SMTP Settings**
- **Vá para**: Authentication → Settings → SMTP
- **Ou**: Authentication → Email Templates → SMTP Settings

#### **2.2 Configurações do Resend**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: re_S5VDWdQn_iUzkwJXv9DtPSQVkZit7ZVMx
Encryption: STARTTLS
```

#### **2.3 Configurações Avançadas**
```
From Email: noreply@evsaday.com (ou seu domínio verificado)
From Name: #20EVSADAY
Reply To: suporte@evsaday.com (opcional)
```

### **3. Verificar Domínio no Resend**

#### **3.1 Acessar Resend Dashboard**
- **URL**: https://resend.com/domains
- **Verifique** se o domínio está configurado

#### **3.2 Se não tiver domínio próprio**
- **Use**: `onboarding@resend.dev` (domínio de teste)
- **Configure** no Supabase:
  ```
  From Email: onboarding@resend.dev
  From Name: #20EVSADAY
  ```

### **4. Testar Configuração**

#### **4.1 Teste Manual**
1. **Vá para**: Authentication → Users
2. **Crie** um usuário de teste
3. **Verifique** se o email de confirmação chega

#### **4.2 Teste via API**
```bash
# Teste SMTP direto
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_S5VDWdQn_iUzkwJXv9DtPSQVkZit7ZVMx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "rafaguipe1402@gmail.com",
    "subject": "Teste #20EVSADAY",
    "html": "<p>Teste de configuração SMTP</p>"
  }'
```

### **5. Configurações Adicionais**

#### **5.1 Rate Limiting**
- **Resend**: 100 emails/dia (gratuito)
- **Supabase**: Configurar rate limiting se necessário

#### **5.2 Templates de Email**
- **Confirm Email**: Template de confirmação
- **Invite Email**: Template de convite
- **Magic Link Email**: Template de magic link
- **Change Email**: Template de mudança de email

### **6. Verificar Configuração**

#### **6.1 Logs do Supabase**
- **Vá para**: Logs → Auth
- **Verifique** se há erros de email

#### **6.2 Logs do Resend**
- **Vá para**: https://resend.com/activity
- **Verifique** se os emails estão sendo enviados

### **7. Troubleshooting**

#### **7.1 Erro 404 na validação**
- ✅ Verificar SMTP settings
- ✅ Verificar domínio no Resend
- ✅ Testar configuração

#### **7.2 Email não chega**
- ✅ Verificar spam
- ✅ Verificar logs do Resend
- ✅ Verificar configuração SMTP

#### **7.3 Erro de autenticação**
- ✅ Verificar API key do Resend
- ✅ Verificar configuração SMTP
- ✅ Verificar domínio

## 🎯 Configurações Finais

### **SMTP Settings (Supabase)**
```
Host: smtp.resend.com
Port: 587
User: resend
Password: re_S5VDWdQn_iUzkwJXv9DtPSQVkZit7ZVMx
Encryption: STARTTLS
From: onboarding@resend.dev
From Name: #20EVSADAY
```

### **Environment Variables (Supabase)**
```
RESEND_API_KEY=re_S5VDWdQn_iUzkwJXv9DtPSQVkZit7ZVMx
SITE_URL=https://20-evsaday.vercel.app
```

## ✅ Resultado Esperado

Após a configuração:
- ✅ Emails de confirmação funcionando
- ✅ Sem erro 404 na validação
- ✅ Logs de email no Resend
- ✅ Sistema de autenticação completo

## 🔍 Verificação Final

1. **Teste de registro**: Crie um novo usuário
2. **Verifique email**: Confirme se chegou
3. **Teste login**: Faça login após confirmação
4. **Verifique logs**: Confirme nos logs do Resend

**Configuração concluída!** 🚀 