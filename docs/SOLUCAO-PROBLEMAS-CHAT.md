# 🔧 Solução de Problemas - Sistema de Chat e DMs

Este guia ajuda a resolver problemas comuns no sistema de chat e mensagens diretas.

## 🚨 Problemas Comuns

### **❌ Erro no canal Realtime**
```
DMNotificationContext.js:171 ❌ Erro no canal Realtime
```

**Causas possíveis:**
- Tabela `chat_ev_direct_messages` não existe
- Problemas de conectividade com Supabase
- Políticas RLS muito restritivas
- Realtime não habilitado na tabela

**Soluções:**

1. **Execute o diagnóstico SQL:**
   ```sql
   -- Execute o arquivo sql/diagnostico-chat-dm.sql
   ```

2. **Reset do sistema de DMs:**
   ```javascript
   // Cole no console do navegador
   // Execute o arquivo scripts/reset-dm-system.js
   ```

3. **Verificar tabela no Supabase:**
   - Acesse Supabase Dashboard
   - Vá para Table Editor
   - Verifique se `chat_ev_direct_messages` existe

### **🔇 Erro de som**
```
NotAllowedError: play() failed because the user didn't interact with the document first
```

**Solução:**
- O erro foi corrigido automaticamente
- O som será tocado no próximo clique do usuário
- Não afeta a funcionalidade do timer

### **🚨 Sistema de DMs desabilitado**
```
🚨 Muitos erros no sistema de DMs. Desabilitando funcionalidade.
```

**Solução:**
1. Execute o script de reset:
   ```javascript
   // Cole no console do navegador
   // Execute o arquivo scripts/reset-dm-system.js
   ```

2. Aguarde 1 hora para reativação automática

3. Ou force reativação:
   ```javascript
   localStorage.removeItem('dm_critical_error');
   location.reload();
   ```

## 🔍 Diagnóstico Passo a Passo

### **1. Verificar Console do Navegador**
- Abra DevTools (F12)
- Vá para Console
- Procure por erros relacionados a:
  - `DMNotificationContext`
  - `Realtime`
  - `chat_ev_direct_messages`

### **2. Verificar Supabase Dashboard**
- Acesse seu projeto no Supabase
- Vá para Table Editor
- Verifique se as tabelas existem:
  - `chat_ev_direct_messages`
  - `chat_ev_messages`

### **3. Verificar Políticas RLS**
```sql
-- Execute no SQL Editor do Supabase
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_direct_messages';
```

### **4. Verificar Realtime**
```sql
-- Execute no SQL Editor do Supabase
ALTER TABLE chat_ev_direct_messages REPLICA IDENTITY FULL;
```

## 🛠️ Scripts de Correção

### **Reset Completo do Sistema**
```javascript
// Cole no console do navegador
localStorage.clear();
sessionStorage.clear();
if (window.supabase) {
  window.supabase.removeAllChannels();
}
location.reload(true);
```

### **Verificar Status do Sistema**
```javascript
// Cole no console do navegador
console.log('DM Critical Error:', localStorage.getItem('dm_critical_error'));
console.log('DM Enabled:', !localStorage.getItem('dm_critical_error'));
```

## 📋 Checklist de Verificação

- [ ] Tabela `chat_ev_direct_messages` existe
- [ ] Políticas RLS configuradas corretamente
- [ ] Realtime habilitado na tabela
- [ ] Função `mark_dm_as_read` existe
- [ ] Usuário tem permissões adequadas
- [ ] Conexão com Supabase estável
- [ ] Cache limpo (localStorage/sessionStorage)

## 🆘 Se Nada Funcionar

1. **Execute diagnóstico completo:**
   ```sql
   -- Execute sql/diagnostico-chat-dm.sql
   ```

2. **Reset completo:**
   ```javascript
   // Execute scripts/reset-dm-system.js
   ```

3. **Verificar logs do Supabase:**
   - Acesse Supabase Dashboard
   - Vá para Logs
   - Procure por erros relacionados ao chat

4. **Contatar suporte:**
   - Inclua logs do console
   - Inclua resultado do diagnóstico SQL
   - Descreva passos para reproduzir o problema

## 📝 Notas Importantes

- O sistema tem proteção contra loops de erro
- Após 3 erros consecutivos, o sistema se desabilita automaticamente
- O sistema se reativa automaticamente após 1 hora
- Sempre teste em ambiente de desenvolvimento primeiro
