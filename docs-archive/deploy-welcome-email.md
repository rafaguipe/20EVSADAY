# 🚀 Deploy da Edge Function - Email de Boas-vindas

## 📋 Pré-requisitos

### 1. Supabase CLI Instalado
```bash
# Instalar Supabase CLI
npm install -g supabase

# Ou usar npx
npx supabase --version
```

### 2. Login no Supabase
```bash
# Fazer login
supabase login

# Verificar projetos
supabase projects list
```

### 3. Link do Projeto
```bash
# No diretório raiz do projeto
supabase link --project-ref YOUR_PROJECT_REF

# Exemplo:
# supabase link --project-ref mbxefiadqcrzqbrfkvxu
```

## 🔧 Deploy da Edge Function

### 1. Verificar Estrutura
```
supabase/
└── functions/
    └── welcome-email/
        └── index.js
```

### 2. Deploy
```bash
# Deploy da função
supabase functions deploy welcome-email

# Ou deploy de todas as funções
supabase functions deploy
```

### 3. Verificar Deploy
```bash
# Listar funções deployadas
supabase functions list
```

## ⚙️ Configurar Variáveis de Ambiente

### 1. No Supabase Dashboard
1. **Acesse**: https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá para**: Settings → Edge Functions
4. **Adicione as variáveis**:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
SITE_URL=https://evsaday.vercel.app
SUPABASE_URL=https://mbxefiadqcrzqbrfkvxu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Obter Service Role Key
1. **Dashboard** → Settings → API
2. **Copie** a "service_role" key (não a anon key)

### 3. Configurar Resend (Opcional)
Se quiser usar Resend para envio de emails:

1. **Criar conta**: https://resend.com
2. **Obter API Key**: Dashboard → API Keys
3. **Adicionar** `RESEND_API_KEY` nas variáveis

## 🧪 Teste da Edge Function

### 1. Via Supabase Dashboard
1. **Dashboard** → Edge Functions
2. **Clique** em "welcome-email"
3. **Teste** com:
```json
{
  "user_id": "e426b8ab-b3f7-443b-b00e-f2e2e053893b",
  "email": "seu-email@exemplo.com",
  "username": "rafaguipe"
}
```

### 2. Via cURL
```bash
curl -X POST https://mbxefiadqcrzqbrfkvxu.supabase.co/functions/v1/welcome-email \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "e426b8ab-b3f7-443b-b00e-f2e2e053893b",
    "email": "seu-email@exemplo.com",
    "username": "rafaguipe"
  }'
```

### 3. Via Frontend (Área Dev)
1. **Acesse** a área Dev
2. **Use** o componente de teste
3. **Clique** em "Enviar Email de Boas-vindas"

## 🔍 Troubleshooting

### Erro "Failed to fetch"
- ✅ **Verificar** se a função foi deployada
- ✅ **Verificar** URL da função no frontend
- ✅ **Verificar** variáveis de ambiente
- ✅ **Verificar** logs da Edge Function

### Verificar Logs
```bash
# Logs da Edge Function
supabase functions logs welcome-email

# Logs em tempo real
supabase functions logs welcome-email --follow
```

### Verificar Status
```bash
# Status da função
supabase functions list

# Informações detalhadas
supabase functions list --json
```

## 📊 Monitoramento

### 1. Logs da Edge Function
```bash
# Últimos logs
supabase functions logs welcome-email --limit 10

# Logs com erro
supabase functions logs welcome-email --level error
```

### 2. Logs do Banco
```sql
-- Verificar logs de email
SELECT * FROM welcome_email_logs ORDER BY sent_at DESC LIMIT 10;

-- Estatísticas
SELECT * FROM welcome_email_statistics;
```

## 🎯 Próximos Passos

### 1. Deploy Completo
```bash
# 1. Link do projeto
supabase link --project-ref mbxefiadqcrzqbrfkvxu

# 2. Deploy da função
supabase functions deploy welcome-email

# 3. Verificar deploy
supabase functions list
```

### 2. Configurar Variáveis
1. **Dashboard** → Settings → Edge Functions
2. **Adicionar** variáveis necessárias
3. **Salvar** configurações

### 3. Testar
1. **Via Dashboard** (teste rápido)
2. **Via Frontend** (teste completo)
3. **Verificar logs** (monitoramento)

## 🚨 Problemas Comuns

### "Function not found"
- ❌ Função não foi deployada
- ✅ Execute: `supabase functions deploy welcome-email`

### "Unauthorized"
- ❌ Service role key incorreta
- ✅ Verifique a key no Dashboard → Settings → API

### "Missing environment variables"
- ❌ Variáveis não configuradas
- ✅ Configure no Dashboard → Settings → Edge Functions

### "Failed to fetch"
- ❌ Problema de rede ou função não disponível
- ✅ Verifique logs: `supabase functions logs welcome-email`

---

**Status**: ⚠️ Aguardando deploy
**Próximo**: Deploy da Edge Function
**Responsável**: Você (rafaguipe) 