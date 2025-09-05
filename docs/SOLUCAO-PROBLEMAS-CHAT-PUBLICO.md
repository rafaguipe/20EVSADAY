# 🔧 Solução de Problemas - Chat Público (Mensagens para Todos)

Este guia ajuda a resolver problemas com mensagens públicas no chat.

## 🚨 Problemas Comuns

### **❌ Mensagens não aparecem no chat público**
- Mensagens são enviadas mas não aparecem na lista
- Erro ao enviar mensagem para todos
- Chat público vazio mesmo com mensagens enviadas

### **❌ Erro ao enviar mensagem**
- Erro 403 (Forbidden) ao enviar mensagem
- Erro 500 (Internal Server Error)
- Mensagem não é salva no banco de dados

## 🔍 Diagnóstico Passo a Passo

### **1. Verificar Console do Navegador**
- Abra DevTools (F12)
- Vá para Console
- Procure por erros relacionados a:
  - `chat_ev_messages`
  - `handleSubmit`
  - `insert`

### **2. Executar Script de Teste**
```javascript
// Execute no console do navegador
// Cole o código de scripts/testar-chat-publico.js
```

### **3. Verificar Supabase Dashboard**
- Acesse seu projeto no Supabase
- Vá para Table Editor
- Verifique se a tabela `chat_ev_messages` existe
- Verifique se há mensagens na tabela

### **4. Executar Diagnóstico SQL**
```sql
-- Execute no SQL Editor do Supabase
-- Cole o código de sql/diagnostico-chat-publico.sql
```

## 🛠️ Soluções Comuns

### **Problema: Tabela não existe**
```sql
-- Criar tabela chat_ev_messages
CREATE TABLE chat_ev_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'encouragement',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Problema: Políticas RLS muito restritivas**
```sql
-- Verificar políticas existentes
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_messages';

-- Criar política para permitir inserção
CREATE POLICY "Users can insert messages" ON chat_ev_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar política para permitir leitura
CREATE POLICY "Users can view messages" ON chat_ev_messages
  FOR SELECT USING (true);
```

### **Problema: Realtime não habilitado**
```sql
-- Habilitar Realtime na tabela
ALTER TABLE chat_ev_messages REPLICA IDENTITY FULL;
```

### **Problema: Perfil do usuário não encontrado**
```javascript
// Verificar se o usuário tem perfil
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (!profile) {
  // Criar perfil básico
  await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      username: user.email.split('@')[0],
      full_name: user.email
    });
}
```

## 📋 Checklist de Verificação

- [ ] Tabela `chat_ev_messages` existe
- [ ] Políticas RLS configuradas corretamente
- [ ] Realtime habilitado na tabela
- [ ] Usuário tem perfil criado
- [ ] Usuário tem permissões adequadas
- [ ] Conexão com Supabase estável
- [ ] Console sem erros JavaScript

## 🧪 Testes Recomendados

### **Teste 1: Estrutura da Tabela**
```javascript
// Execute no console
const { data, error } = await supabase
  .from('chat_ev_messages')
  .select('*')
  .limit(1);
console.log('Resultado:', data, error);
```

### **Teste 2: Inserção de Mensagem**
```javascript
// Execute no console
const { data, error } = await supabase
  .from('chat_ev_messages')
  .insert({
    user_id: 'seu-user-id',
    username: 'Teste',
    message: 'Mensagem de teste',
    message_type: 'encouragement'
  });
console.log('Resultado:', data, error);
```

### **Teste 3: Realtime**
```javascript
// Execute no console
const channel = supabase
  .channel('test')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_ev_messages'
  }, (payload) => {
    console.log('Nova mensagem:', payload);
  })
  .subscribe();
```

## 🆘 Se Nada Funcionar

1. **Execute diagnóstico completo:**
   ```sql
   -- Execute sql/diagnostico-chat-publico.sql
   ```

2. **Teste com script JavaScript:**
   ```javascript
   // Execute scripts/testar-chat-publico.js
   ```

3. **Verificar logs do Supabase:**
   - Acesse Supabase Dashboard
   - Vá para Logs
   - Procure por erros relacionados ao chat

4. **Reset completo:**
   ```javascript
   // Execute scripts/reset-dm-system.js
   ```

## 📝 Notas Importantes

- Mensagens públicas são diferentes de DMs
- Requer tabela `chat_ev_messages` separada
- Políticas RLS devem permitir leitura pública
- Realtime deve estar habilitado para notificações
- Usuário deve ter perfil criado antes de enviar mensagens
