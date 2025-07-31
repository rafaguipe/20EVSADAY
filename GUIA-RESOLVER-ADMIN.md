# Guia para Resolver Problema de Permissões de Administrador

## 🔍 Diagnóstico do Problema

O erro `ERROR: P0001: Apenas administradores podem alterar configurações do sistema` ocorre porque a função `set_system_setting` verifica se o usuário tem `is_admin = true` na tabela `profiles`.

## 📋 Passos para Resolver

### Opção 1: Verificar e Corrigir Status de Admin (Recomendado)

1. **Execute o script de verificação:**
   - Abra o **Supabase Dashboard**
   - Vá para **SQL Editor**
   - Execute o arquivo `verificar-admin-status.sql`

2. **Este script irá:**
   - Verificar se você existe na tabela `profiles`
   - Tornar você administrador se necessário
   - Testar se a função `set_system_setting` funciona

### Opção 2: Script Alternativo (Sem Autenticação)

Se a Opção 1 não funcionar, use o script alternativo:

1. **Execute o script alternativo:**
   - No **Supabase SQL Editor**
   - Execute o arquivo `setup-sobre-config-admin.sql`

2. **Este script:**
   - Não depende da autenticação
   - Insere diretamente na tabela `system_settings`
   - Pode ser executado por qualquer usuário com acesso ao SQL Editor

## 🔧 Verificações Manuais

### 1. Verificar se você está logado no Supabase

```sql
-- Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;
```

### 2. Verificar se a tabela profiles existe

```sql
-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_table_exists;
```

### 3. Verificar seu status na tabela profiles

```sql
-- Verificar seu perfil
SELECT 
    user_id,
    email,
    is_admin,
    created_at
FROM profiles 
WHERE user_id = auth.uid();
```

### 4. Tornar-se administrador manualmente

```sql
-- Se você não existir na tabela, criar
INSERT INTO profiles (user_id, email, is_admin, created_at)
VALUES (auth.uid(), auth.email(), true, NOW())
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;

-- Se já existir, tornar admin
UPDATE profiles 
SET is_admin = true
WHERE user_id = auth.uid();
```

## 🚨 Possíveis Causas do Problema

1. **Usuário não existe na tabela `profiles`**
   - Solução: Criar entrada na tabela

2. **Usuário existe mas `is_admin = false`**
   - Solução: Atualizar para `is_admin = true`

3. **Tabela `profiles` não existe**
   - Solução: Criar a tabela primeiro

4. **Problema de autenticação**
   - Solução: Usar script alternativo

## ✅ Como Verificar se Funcionou

Após executar os scripts, verifique:

```sql
-- Verificar configurações criadas
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key IN (
    'sobre_gpc_text',
    'sobre_liderare_text',
    'sobre_visible',
    'loja_visible',
    'multimidia_visible',
    'chat_visible',
    'badges_visible',
    'leaderboard_visible',
    'loja_products'
)
ORDER BY setting_key;
```

## 🎯 Próximos Passos

1. Execute um dos scripts acima
2. Verifique se as configurações foram criadas
3. Teste a aplicação para ver se as novas funcionalidades funcionam
4. Se ainda houver problemas, verifique os logs de erro

## 📞 Suporte

Se nenhuma das opções funcionar, verifique:
- Se você tem acesso ao SQL Editor do Supabase
- Se a tabela `system_settings` existe
- Se as funções `get_system_setting` e `set_system_setting` foram criadas 