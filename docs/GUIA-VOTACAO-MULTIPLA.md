# 🗳️ Guia da Votação Múltipla do Mascote

## 📋 Resumo das Mudanças

O sistema de votação foi modificado para permitir que cada usuário vote em **até 3 opções diferentes** de nomes para o mascote, em vez de apenas 1.

## 🔧 Modificações Realizadas

### 1. **Schema do Banco de Dados**
- ✅ Removida a constraint `UNIQUE` que limitava a 1 voto por usuário
- ✅ Criado trigger `check_vote_limit_trigger` para limitar a 3 votos por usuário
- ✅ Criado trigger para evitar votos duplicados na mesma opção
- ✅ Atualizadas as políticas RLS para permitir múltiplas inserções

### 2. **Funções SQL Criadas/Atualizadas**
- ✅ `check_user_vote_status()` - Verifica quantos votos o usuário já fez
- ✅ `get_mascot_voting_results()` - Retorna resultados com contagem de votos
- ✅ `get_user_votes()` - Retorna todos os votos de um usuário específico
- ✅ `check_user_vote_limit()` - Função do trigger para validação

### 3. **Interface do Usuário**
- ✅ Modificada para permitir seleção múltipla (até 3 opções)
- ✅ Contador visual mostrando seleções atuais (X/3)
- ✅ Botões desabilitados quando limite é atingido
- ✅ Mensagem de status mostrando votos restantes
- ✅ Feedback visual com ✓ para opções selecionadas

## 🚀 Como Executar as Mudanças

### Passo 1: Resetar Votação Atual
```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: sql/reset-votacao-mascote.sql
```

### Passo 2: Aplicar Modificações do Schema
```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: sql/modificar-schema-votacao-multipla.sql
```

### Passo 3: Testar o Sistema
```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: sql/testar-votacao-multipla.sql
```

## 🎯 Funcionalidades do Novo Sistema

### Para o Usuário:
1. **Seleção Múltipla**: Pode escolher até 3 opções diferentes
2. **Feedback Visual**: Contador (X/3) e ✓ nas opções selecionadas
3. **Validação**: Não pode votar na mesma opção duas vezes
4. **Limite**: Máximo de 3 votos por usuário
5. **Status**: Vê quantos votos já fez e quantos restam

### Para o Administrador:
1. **Controle Total**: Pode ver todos os votos
2. **Relatórios**: Resultados com contagem de votos e percentuais
3. **Monitoramento**: Pode verificar usuários com múltiplos votos
4. **Reset**: Pode resetar a votação quando necessário

## 📊 Exemplo de Uso

### Antes (Sistema Antigo):
- Usuário escolhe 1 opção
- Vota 1 vez
- Não pode votar novamente

### Agora (Sistema Novo):
- Usuário escolhe até 3 opções
- Vota 1 vez (mas com múltiplas escolhas)
- Não pode votar novamente
- Pode ver todos os seus votos

## 🔍 Validações Implementadas

1. **Limite de Votos**: Máximo 3 votos por usuário
2. **Sem Duplicatas**: Não pode votar na mesma opção duas vezes
3. **Autenticação**: Apenas usuários logados podem votar
4. **RLS**: Políticas de segurança mantidas
5. **Trigger**: Validação automática no banco de dados

## 🚨 Troubleshooting

### Problema: "Usuário já votou 3 vezes"
**Solução**: O usuário atingiu o limite de 3 votos. Isso é normal.

### Problema: "Usuário já votou nesta opção"
**Solução**: O usuário tentou votar na mesma opção duas vezes. Escolha uma opção diferente.

### Problema: Funções não encontradas
**Solução**: Execute novamente o script `sql/modificar-schema-votacao-multipla.sql`

### Problema: Trigger não funciona
**Solução**: Verifique se o trigger foi criado corretamente com o script de teste

## 📈 Benefícios do Novo Sistema

1. **Mais Democrático**: Usuários podem expressar múltiplas preferências
2. **Melhor Experiência**: Interface mais intuitiva e informativa
3. **Dados Ricos**: Mais informações sobre as preferências dos usuários
4. **Flexibilidade**: Sistema pode ser facilmente ajustado para outros limites
5. **Segurança**: Mantém todas as validações de segurança

## 🎉 Próximos Passos

1. Execute os scripts SQL na ordem correta
2. Teste o sistema com diferentes usuários
3. Monitore os resultados da votação
4. Ajuste se necessário (ex: mudar limite de 3 para outro número)

---

**Sistema atualizado com sucesso!** 🚀
