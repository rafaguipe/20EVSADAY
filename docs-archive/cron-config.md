# ⏰ Configuração do Sistema de Relatórios Diários

## 📋 Visão Geral

O sistema de relatórios diários envia automaticamente um relatório personalizado para cada usuário após a meia-noite do seu horário local, contendo:

- 📊 Estatísticas do dia anterior
- 📈 Distribuição de pontuações
- 📝 Lista de EVs registrados
- 🏆 Badges conquistados
- 💪 Mensagem motivacional

## 🚀 Configuração

### 1. Edge Function (Supabase)

1. **Criar a Edge Function:**
   ```bash
   supabase functions new daily-reports
   ```

2. **Copiar o código:**
   - Copie o conteúdo de `supabase/functions/daily-reports/index.js`

3. **Deploy da função:**
   ```bash
   supabase functions deploy daily-reports
   ```

### 2. Configuração do Banco de Dados

1. **Executar script SQL:**
   - Execute `setup-daily-reports.sql` no Supabase SQL Editor

2. **Verificar configuração:**
   ```sql
   SELECT * FROM daily_report_statistics LIMIT 5;
   ```

### 3. Configuração de Email (Resend)

1. **Criar conta no Resend:**
   - Acesse [resend.com](https://resend.com)
   - Crie uma conta gratuita

2. **Configurar domínio:**
   - Adicione seu domínio (ex: evsaday.com)
   - Configure os registros DNS

3. **Obter API Key:**
   - Vá em Settings > API Keys
   - Crie uma nova chave

4. **Configurar variável de ambiente:**
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
   ```

### 4. Configuração do Cron Job

#### Opção A: Supabase Cron (Recomendado)

1. **Criar cron job no Supabase:**
   ```sql
   SELECT cron.schedule(
     'daily-reports',
     '0 1 * * *', -- Executa às 1h da manhã UTC (meia-noite em Brasília)
     'SELECT net.http_post(
       url:=''https://your-project.supabase.co/functions/v1/daily-reports'',
       headers:=''{"Authorization": "Bearer YOUR_ANON_KEY"}'',
       body:=''{}''
     );'
   );
   ```

#### Opção B: Cron Externo (Vercel Cron)

1. **Criar arquivo `vercel.json`:**
   ```json
   {
     "crons": [
       {
         "path": "/api/daily-reports",
         "schedule": "0 1 * * *"
       }
     ]
   }
   ```

2. **Criar API route:**
   ```javascript
   // pages/api/daily-reports.js
   export default async function handler(req, res) {
     const response = await fetch(
       'https://your-project.supabase.co/functions/v1/daily-reports',
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
         }
       }
     );
     
     const data = await response.json();
     res.status(200).json(data);
   }
   ```

#### Opção C: GitHub Actions

1. **Criar `.github/workflows/daily-reports.yml`:**
   ```yaml
   name: Daily Reports
   on:
     schedule:
       - cron: '0 1 * * *'  # 1h UTC (meia-noite Brasília)
   
   jobs:
     send-reports:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Send Daily Reports
           run: |
             curl -X POST \
               -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
               https://your-project.supabase.co/functions/v1/daily-reports
   ```

## 📊 Monitoramento

### 1. Logs de Relatórios

```sql
-- Ver relatórios enviados hoje
SELECT * FROM daily_report_logs 
WHERE report_date = CURRENT_DATE - INTERVAL '1 day'
ORDER BY sent_at DESC;

-- Estatísticas dos últimos 7 dias
SELECT * FROM daily_report_statistics 
WHERE report_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY report_date DESC;
```

### 2. Logs da Edge Function

```bash
# Ver logs da função
supabase functions logs daily-reports

# Ver logs em tempo real
supabase functions logs daily-reports --follow
```

### 3. Métricas de Email

- Acesse o dashboard do Resend
- Verifique delivery rates
- Monitore bounces e spam reports

## 🔧 Personalização

### 1. Horário de Envio

Para alterar o horário de envio, modifique o cron:

```bash
# Enviar às 2h da manhã UTC (23h em Brasília)
'0 2 * * *'

# Enviar às 6h da manhã UTC (3h em Brasília)
'0 6 * * *'
```

### 2. Template do Email

Edite a função `generateReportHTML()` no arquivo da Edge Function para personalizar:

- Cores e estilo
- Informações exibidas
- Mensagens motivacionais
- Layout responsivo

### 3. Filtros de Usuários

Para enviar apenas para usuários ativos:

```javascript
// Adicionar filtro na query de usuários
const { data: users } = await supabase
  .from('profiles')
  .select('user_id, username, email')
  .not('email', 'is', null)
  .gte('last_login', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 dias
```

## 🚨 Solução de Problemas

### 1. Emails não sendo enviados

- Verificar API key do Resend
- Verificar logs da Edge Function
- Verificar configuração do domínio

### 2. Relatórios duplicados

- Verificar função `check_report_sent()`
- Verificar logs na tabela `daily_report_logs`

### 3. Performance lenta

- Verificar índices da tabela
- Otimizar queries
- Considerar processamento em lotes

## 📈 Estatísticas

### Comandos úteis:

```sql
-- Total de relatórios enviados
SELECT COUNT(*) FROM daily_report_logs WHERE status = 'success';

-- Taxa de sucesso dos últimos 30 dias
SELECT * FROM get_report_stats(
  CURRENT_DATE - INTERVAL '30 days', 
  CURRENT_DATE
);

-- Usuários que mais receberam relatórios
SELECT 
  p.username,
  COUNT(*) as reports_received
FROM daily_report_logs l
JOIN profiles p ON l.user_id = p.user_id
WHERE l.status = 'success'
GROUP BY p.username, p.user_id
ORDER BY reports_received DESC
LIMIT 10;
```

## 🎯 Próximos Passos

1. **Testar em ambiente de desenvolvimento**
2. **Configurar monitoramento**
3. **Implementar retry automático**
4. **Adicionar personalização por usuário**
5. **Criar dashboard de métricas** 