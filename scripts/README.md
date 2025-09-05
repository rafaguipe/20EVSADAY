# 📜 Scripts Utilitários

Esta pasta contém scripts JavaScript utilitários para o projeto EVSADAY.

## 🗂️ Arquivos

### **🧹 `limpar-cache-badges.js`**
Script para limpar cache e forçar recarga das badges no navegador.

**Como usar:**
1. Abra o console do navegador (F12)
2. Cole e execute o código do arquivo
3. A página será recarregada sem cache

**Funcionalidades:**
- Remove cache de badges do localStorage
- Limpa sessionStorage
- Força recarga da página

### **📊 `daily-report-system.js`**
Sistema de relatório diário automático para envio de emails personalizados.

**Funcionalidades:**
- Gera relatórios diários para usuários
- Calcula estatísticas de EVs
- Cria HTML responsivo para emails
- Sistema de mensagens motivacionais
- Envio em massa para todos os usuários

**Como usar:**
```bash
# Executar relatórios diários
node scripts/daily-report-system.js
```

**Configuração necessária:**
- Variáveis de ambiente do Supabase
- Serviço de email (Resend, SendGrid, etc.)

### **🔄 `reset-dm-system.js`**
Script para resetar o sistema de DMs e limpar cache quando há problemas.

**Funcionalidades:**
- Limpa cache de DMs do localStorage
- Remove erros críticos do sistema
- Desconecta canais Realtime
- Força recarga da página

**Como usar:**
1. Abra o console do navegador (F12)
2. Cole e execute o código do arquivo
3. A página será recarregada sem cache

### **🔧 `corrigir-busca-badges.js`**
Script para diagnosticar e corrigir problemas de busca de badges com caracteres especiais.

**Funcionalidades:**
- Testa busca de badges problemáticas
- Implementa busca alternativa sem acentos
- Limpa cache de badges
- Mostra logs detalhados dos resultados

**Como usar:**
1. Abra o console do navegador (F12)
2. Cole e execute o código do arquivo
3. Verifique os logs para identificar problemas

### **💬 `testar-chat-publico.js`**
Script para diagnosticar problemas com mensagens públicas no chat.

**Funcionalidades:**
- Testa envio de mensagens para todos
- Verifica estrutura da tabela chat_ev_messages
- Testa conexão Realtime
- Mostra logs detalhados dos resultados

**Como usar:**
1. Abra o console do navegador (F12)
2. Cole e execute o código do arquivo
3. Verifique os logs para identificar problemas

### **💬 `testar-chat-simples.js`**
Script simplificado para testar o chat público (versão mais rápida).

**Funcionalidades:**
- Testa acesso à tabela
- Verifica perfil do usuário
- Testa envio de mensagem
- Mostra resultados claros

**Como usar:**
1. Abra o console do navegador (F12)
2. Cole e execute o código do arquivo
3. Verifique os resultados dos testes

### **💬 `testar-chat-basico.js`**
Script básico para testar o chat público (versão mais compatível).

**Funcionalidades:**
- Testa acesso à tabela
- Verifica perfil do usuário
- Testa envio de mensagem
- Verifica se mensagem aparece
- Mostra soluções para problemas

**Como usar:**
1. Abra o console do navegador (F12)
2. Cole e execute o código do arquivo
3. Siga as sugestões de solução se houver erros

## ⚠️ Importante

- Execute scripts apenas em ambiente de desenvolvimento/teste
- Configure variáveis de ambiente antes de usar
- Faça backup antes de executar scripts de modificação
- Teste em pequena escala antes de produção

## 📝 Notas

- Scripts são independentes do frontend React
- Podem ser executados via Node.js ou cron jobs
- Requerem configuração adequada de serviços externos
