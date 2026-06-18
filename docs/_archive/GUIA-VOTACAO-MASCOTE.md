# 🗳️ Guia do Sistema de Votação do Mascote

## Visão Geral
Sistema completo para votação do nome do mascote do #20EVSADAY, com 60+ opções de nomes e votação única por usuário.

## 🚀 Como Implementar

### 1. Configurar Banco de Dados
Execute o script SQL no Supabase SQL Editor:
```sql
-- Execute o arquivo: sql/setup-mascot-voting.sql
```

### 2. Testar Configuração
Execute o script de teste:
```sql
-- Execute o arquivo: sql/testar-votacao-mascote.sql
```

### 3. Acessar a Votação
- **URL**: `/votacao-mascote`
- **Requisito**: Usuário deve estar logado
- **Link na navbar**: 🗳️ Votação

## 📋 Funcionalidades

### ✅ Sistema de Votação Única
- Cada usuário pode votar apenas **uma vez**
- Voto é vinculado ao `user_id` do Supabase Auth
- Constraint `UNIQUE(user_id)` garante votação única

### 🎯 Opções de Votação
60+ nomes disponíveis, incluindo:
- Energolino, e-Valdo, Sereninho
- EVwaldo, Vibralino, Evino
- EVoluício, EVoluído, Evol
- Eva, Evo, Evinha, Zenit
- E muitos outros...

### 📊 Sistema de Resultados
- **Antes de votar**: Interface de seleção
- **Após votar**: Página de agradecimento + resultados
- **Ranking**: Top 10 mais votados
- **Percentuais**: Calculados automaticamente

## 🔧 Estrutura Técnica

### Tabelas Criadas
1. **`mascot_options`**: Armazena as opções de nomes
2. **`mascot_votes`**: Armazena os votos dos usuários

### Funções SQL
1. **`get_mascot_voting_results()`**: Retorna ranking com percentuais
2. **`user_has_voted()`**: Verifica se usuário já votou
3. **`get_user_vote()`**: Retorna voto do usuário atual

### Segurança (RLS)
- **Leitura de opções**: Todos podem ver
- **Votação**: Apenas usuários autenticados
- **Visualização de votos**: Apenas próprios votos
- **Resultados agregados**: Todos podem ver

## 🎨 Interface do Usuário

### Antes de Votar
- Grid responsivo com todas as opções
- Seleção visual com hover effects
- Botão de votar habilitado após seleção
- Loading state durante envio

### Após Votar
- Mensagem de agradecimento
- Confirmação do voto escolhido
- Ranking dos top 10 mais votados
- Percentuais e contadores de votos

## 📱 Responsividade
- **Desktop**: Grid de múltiplas colunas
- **Mobile**: Grid adaptativo
- **Tablet**: Layout intermediário

## 🔍 Monitoramento

### Verificar Votos
```sql
-- Total de votos
SELECT COUNT(*) FROM mascot_votes;

-- Resultados atuais
SELECT * FROM get_mascot_voting_results();

-- Usuários que votaram
SELECT COUNT(DISTINCT user_id) FROM mascot_votes;
```

### Verificar Problemas
```sql
-- Usuários sem voto (se necessário)
SELECT au.email, au.created_at
FROM auth.users au
LEFT JOIN mascot_votes mv ON au.id = mv.user_id
WHERE mv.user_id IS NULL
ORDER BY au.created_at DESC;
```

## 🚨 Solução de Problemas

### Erro: "Usuário já votou"
- **Causa**: Tentativa de votar novamente
- **Solução**: Sistema bloqueia automaticamente

### Erro: "Não autenticado"
- **Causa**: Usuário não logado
- **Solução**: Redirecionar para login

### Erro: "Opção não encontrada"
- **Causa**: ID de opção inválido
- **Solução**: Recarregar página

## 📈 Estatísticas Úteis

### Queries de Análise
```sql
-- Participação por dia
SELECT 
  DATE(voted_at) as dia,
  COUNT(*) as votos
FROM mascot_votes
GROUP BY DATE(voted_at)
ORDER BY dia DESC;

-- Top 5 mais votados
SELECT * FROM get_mascot_voting_results()
LIMIT 5;

-- Total de participantes
SELECT COUNT(DISTINCT user_id) as total_participantes
FROM mascot_votes;
```

## 🎯 Próximos Passos

1. **Executar setup**: `sql/setup-mascot-voting.sql`
2. **Testar sistema**: `sql/testar-votacao-mascote.sql`
3. **Acessar votação**: `/votacao-mascote`
4. **Monitorar resultados**: Usar queries de análise

## 📞 Suporte
Em caso de problemas:
1. Verificar logs do console do navegador
2. Executar script de teste SQL
3. Verificar políticas RLS no Supabase
4. Confirmar que usuário está autenticado

---

**Sistema criado para #20EVSADAY** 🚀
