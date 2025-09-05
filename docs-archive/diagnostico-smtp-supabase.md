# 🔧 Diagnóstico SMTP Supabase - Passo a Passo

## 🎯 Problema Atual
- ✅ Registro funciona (sem confirmação de email)
- ❌ Magic link não funciona
- ❌ Email de confirmação não funciona
- ❌ Erro: "Error sending magic link email"

## 🔍 Passo 1: Verificar Configuração Atual

### **1.1 Acessar SMTP Settings**
- **URL**: https://supabase.com/dashboard/project/mbxefiadqcrzqbrfkvxu
- **Vá para**: Authentication → Settings → SMTP
- **Verifique** se está habilitado

### **1.2 Configurações Atuais (Anotar)**
```
Host: _______________
Port: _______________
User: _______________
Password: _______________
From Email: _______________
From Name: _______________
```

## 🔧 Passo 2: Testar Configuração SMTP

### **2.1 Desabilitar SMTP Temporariamente**
- **Vá para**: Authentication → Settings → SMTP
- **Desabilite** SMTP (mude para OFF)
- **Salve** configurações

### **2.2 Testar Magic Link**
- **Acesse**: https://20-evsaday.vercel.app
- **Clique** em "Esqueci minha senha"
- **Digite** seu email
- **Verifique** se funciona sem SMTP

## 🔧 Passo 3: Reconfigurar SMTP Corretamente

### **3.1 Configurações Resend (Corretas)**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: re_S5VDWdQn_iUzkwJXv9DtPSQVkZit7ZVMx
Encryption: STARTTLS
From Email: onboarding@resend.dev
From Name: #20EVSADAY
```

### **3.2 Habilitar SMTP**
- **Ative** SMTP novamente
- **Configure** as configurações acima
- **Salve** configurações

## 🔧 Passo 4: Testar Passo a Passo

### **4.1 Teste 1: Magic Link**
- **Acesse**: Login → "Esqueci minha senha"
- **Digite**: rafaguipe1402@gmail.com
- **Verifique**: Se email chega

### **4.2 Teste 2: Confirmação de Email**
- **Habilite**: Email confirmations
- **Teste**: Registro de novo usuário
- **Verifique**: Se email de confirmação chega

### **4.3 Teste 3: Logs**
- **Acesse**: Logs → Auth
- **Verifique**: Se há erros de email

## 🔧 Passo 5: Troubleshooting

### **5.1 Se Magic Link não funcionar**
- Verificar configuração SMTP
- Verificar logs do Supabase
- Verificar logs do Resend

### **5.2 Se Email não chegar**
- Verificar spam
- Verificar configuração From Email
- Verificar domínio no Resend

### **5.3 Se der erro de autenticação**
- Verificar API key do Resend
- Verificar configuração SMTP
- Verificar domínio

## 🎯 Próximos Passos

1. **Desabilite** SMTP temporariamente
2. **Teste** magic link sem SMTP
3. **Reconfigure** SMTP corretamente
4. **Teste** passo a passo
5. **Verifique** logs

## 💡 Dicas

- **Sempre teste** uma funcionalidade por vez
- **Verifique logs** após cada teste
- **Use email real** para testes
- **Mantenha** confirmação desabilitada até SMTP funcionar 