# 📋 Guia de Execução dos Scripts SQL

## 🎯 Scripts Necessários

### **1. Executar primeiro: `funcoes-sql-email.sql`**

**Onde executar:** Supabase SQL Editor
**URL:** https://supabase.com/dashboard/project/mbxefiadqcrzqbrfkvxu/sql

**O que faz:**
- ✅ Cria função `get_pending_welcome_emails()`
- ✅ Cria função `get_pending_users_list()`
- ✅ Cria função `trigger_welcome_email_for_user()`
- ✅ Cria view `welcome_email_statistics_detailed`

**Como executar:**
1. **Acesse** o Supabase Dashboard
2. **Vá para** SQL Editor
3. **Cole** o conteúdo do arquivo `funcoes-sql-email.sql`
4. **Clique** em "Run"

### **2. Executar segundo: `enviar-para-todos.sql`**

**Onde executar:** Supabase SQL Editor

**O que faz:**
- ✅ Verifica usuários pendentes
- ✅ Lista usuários que precisam receber email
- ✅ Cria funções para envio em massa

**Como executar:**
1. **Cole** o conteúdo do arquivo `enviar-para-todos.sql`
2. **Clique** em "Run"

## 🧪 Testar as Funções

### **Teste 1: Verificar estatísticas**
```sql
SELECT get_pending_welcome_emails();
```

### **Teste 2: Listar usuários pendentes**
```sql
SELECT * FROM get_pending_users_list();
```

### **Teste 3: Ver estatísticas detalhadas**
```sql
SELECT * FROM welcome_email_statistics_detailed;
```

## ✅ Verificar se funcionou

Após executar os scripts, você deve ver:

1. **No console do navegador:** Sem mais erros 404
2. **Na aba Dev:** Componente "📧 Envio em Massa de Emails" funcionando
3. **Botão "📊 Verificar Pendentes":** Mostra estatísticas
4. **Botão "🚀 Enviar para Todos":** Funciona sem erros

## 🔧 Se ainda der erro

### **Erro 404 na função:**
- Verifique se executou o script `funcoes-sql-email.sql`
- Aguarde alguns segundos após executar
- Recarregue a página

### **Erro CORS:**
- Verifique se a Edge Function `send-bulk-welcome-emails` foi deployada
- Execute: `npx supabase functions deploy send-bulk-welcome-emails`

### **Erro de permissão:**
- Verifique se o usuário é admin
- Execute: `SELECT is_admin FROM profiles WHERE user_id = 'seu-user-id';`

## 📊 Resultado Esperado

Após executar corretamente:

```
✅ Funções SQL criadas
✅ Edge Functions deployadas  
✅ Componente funcionando
✅ Envio em massa operacional
✅ Estatísticas em tempo real
```

**Execute os scripts SQL primeiro, depois teste o sistema!** 🚀 