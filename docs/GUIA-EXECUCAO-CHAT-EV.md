# 💬 Chat EV - Guia de Execução

## 🚫 Problema Atual
- ❌ Erro 404: Funções SQL não encontradas
- ❌ `get_chat_ev_messages` não existe
- ❌ `insert_chat_ev_message` não existe

## 🔧 Solução: Executar Schema SQL

### **1. Acesse o Supabase SQL Editor**
- **URL**: https://supabase.com/dashboard/project/mbxefiadqcrzqbrfkvxu/sql
- **Ou**: Dashboard → SQL Editor

### **2. Cole o Schema Completo**
Copie **TODO** o conteúdo do arquivo `chat-ev-schema.sql` e cole no SQL Editor.

### **3. Execute o Schema**
- **Clique** em "Run" ou "Execute"
- **Aguarde** a execução completa
- **Verifique** se não há erros

## 📊 O que será criado:

### **Tabela:**
- ✅ `chat_ev_messages` - Armazena mensagens do chat

### **Funções:**
- ✅ `insert_chat_ev_message()` - Inserir mensagem com validação
- ✅ `get_chat_ev_messages()` - Buscar mensagens recentes
- ✅ `update_chat_ev_updated_at()` - Atualizar timestamp

### **Índices:**
- ✅ Performance otimizada para consultas

### **RLS (Segurança):**
- ✅ Políticas de acesso configuradas
- ✅ Usuários só veem mensagens aprovadas
- ✅ Admins podem gerenciar todas as mensagens

## 🧪 Teste após execução:

### **1. Verificar se as funções foram criadas:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%chat_ev%';
```

### **2. Testar função de busca:**
```sql
SELECT * FROM get_chat_ev_messages(10, 0);
```

### **3. Testar no frontend:**
- **Acesse**: https://20-evsaday.vercel.app
- **Faça login**
- **Clique** em "💬 Chat EV"
- **Teste** enviar uma mensagem

## ✅ Resultado Esperado:

Após executar o schema:
- ✅ Sem erros 404
- ✅ Chat carrega mensagens
- ✅ Envio de mensagens funciona
- ✅ Interface responsiva

## 🔍 Se ainda der erro:

### **Verificar se o schema foi executado:**
```sql
-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'chat_ev_messages';

-- Verificar se as funções existem
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_chat_ev_messages', 'insert_chat_ev_message');
```

**Execute o schema SQL primeiro, depois teste o chat!** 🚀 