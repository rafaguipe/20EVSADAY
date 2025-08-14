# 📧 Sistema de Email em Massa - Instruções de Configuração

## 🚀 Configuração Inicial

### 1. Executar Script SQL no Supabase
Execute o arquivo `corrigir-funcoes-email-v2.sql` no SQL Editor do Supabase para:
- Criar as funções necessárias
- Criar a tabela de logs
- Configurar permissões

**⚠️ IMPORTANTE:** Use o arquivo `corrigir-funcoes-email-v2.sql` que resolve definitivamente o erro de tipos!

### 2. Deploy da Edge Function
A nova Edge Function `send-bulk-custom-emails` precisa ser deployada no Supabase:

**Opção 1: Via CLI Supabase**
```bash
supabase functions deploy send-bulk-custom-emails
```

**Opção 2: Via Dashboard do Supabase**
1. Acesse o Dashboard do Supabase
2. Vá para "Edge Functions"
3. Clique em "Create a new function"
4. Nome: `send-bulk-custom-emails`
5. Cole o código do arquivo `supabase/functions/send-bulk-custom-emails/index.ts`
6. Clique em "Deploy"

## 📝 Como Usar

### Email de Boas-vindas em Massa
- **Verificar Pendentes**: Mostra quantos usuários não receberam email de boas-vindas
- **Enviar Boas-vindas**: Envia email automático para usuários pendentes

### Email Personalizado em Massa ⭐ NOVO
- **Assunto**: Digite o assunto do email
- **Mensagem**: Digite sua mensagem personalizada
- **Personalização**: Use `{usuario}` no texto para incluir o nome do usuário
- **Envio**: Clica em "Enviar Email Personalizado para Todos"

## 💡 Exemplos de Uso

### Exemplo 1: Anúncio Geral
- **Assunto**: 🎉 Nova Funcionalidade Disponível!
- **Mensagem**: 
```
Olá {usuario}! 

Temos uma novidade incrível para você!
Uma nova funcionalidade foi adicionada ao sistema.

Acesse agora para conferir!
```

### Exemplo 2: Lembrete Personalizado
- **Assunto**: ⏰ Lembrete Importante, {usuario}
- **Mensagem**:
```
Oi {usuario}! 

Não esqueça de registrar seus EVs hoje!
A consistência é fundamental para o desenvolvimento.

Continue firme na jornada! 🚀
```

## ⚠️ Importante

- **O email personalizado envia para TODOS os usuários cadastrados com email confirmado**
- **Use `{usuario}` para personalizar a mensagem**
- **Teste sempre com um usuário específico antes de enviar em massa**
- **O sistema evita duplicatas apenas para emails de boas-vindas**

## 🔧 Solução de Problemas

### Erro 404 na função get_pending_welcome_emails
Execute o script SQL para criar as funções necessárias.

### Erro 42804: structure of query does not match function result type
Este erro indica incompatibilidade de tipos de dados. **SOLUÇÃO DEFINITIVA:**

1. **Use o arquivo `corrigir-funcoes-email-v2.sql`** que resolve automaticamente os tipos
2. **Este arquivo usa CAST explícito** (`::TEXT`, `::UUID`, etc.) para garantir compatibilidade
3. **Remove funções problemáticas** com `DROP FUNCTION CASCADE` antes de recriar
4. **Inclui testes automáticos** para verificar se tudo está funcionando

**Se ainda persistir o erro, execute este comando manual:**
```sql
DROP FUNCTION IF EXISTS get_pending_users_list() CASCADE;
```
E depois execute o script completo novamente.

### Erro de permissão
Verifique se o usuário tem role de admin no sistema.

### Emails não sendo enviados
Verifique se a Edge Function está deployada e se as variáveis de ambiente estão configuradas.

## 📊 Monitoramento

Todos os envios são logados na tabela `welcome_email_logs` com:
- ID do usuário
- Username
- Email
- Status (sent/failed)
- Data/hora do envio
- Tipo do email
- Assunto
- Mensagem de erro (se houver)
