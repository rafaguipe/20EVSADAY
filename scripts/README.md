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

## ⚠️ Importante

- Execute scripts apenas em ambiente de desenvolvimento/teste
- Configure variáveis de ambiente antes de usar
- Faça backup antes de executar scripts de modificação
- Teste em pequena escala antes de produção

## 📝 Notas

- Scripts são independentes do frontend React
- Podem ser executados via Node.js ou cron jobs
- Requerem configuração adequada de serviços externos
