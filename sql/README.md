# 📁 Arquivos SQL Essenciais

Esta pasta contém os arquivos SQL essenciais para o funcionamento do projeto EVSADAY.

## 🗂️ Arquivos Organizados

### **📋 Schema Principal**
- `supabase-schema.sql` - Schema completo do banco de dados (tabelas principais)

### **💬 Sistema de Chat**
- `chat-ev-schema.sql` - Schema das tabelas de chat
- `chat-functions.sql` - Funções SQL para o sistema de chat

### **📧 Sistema de Email**
- `funcoes-sql-email.sql` - Funções para envio de emails de boas-vindas

### **💬 Sistema de Mensagens Diretas (DM)**
- `add-dm-system.sql` - Schema e funções para sistema de mensagens diretas

### **🏆 Sistema de Selos**
- `atribuir-selo-primeiro-ev-coletivo.sql` - Script para atribuir selo "Primeiro EV coletivo"

### **📊 Relatórios e Consultas**
- `listar-emails-usuarios.sql` - SQL para listar todos os emails dos usuários
- `usuarios-sem-ev.sql` - SQL para identificar usuários que se cadastraram mas nunca registraram EV

## 🚀 Como Usar

1. **Para setup inicial**: Execute `supabase-schema.sql` primeiro
2. **Para funcionalidades específicas**: Execute os arquivos conforme necessário
3. **Para relatórios**: Use os arquivos de consulta para análises

## ⚠️ Importante

- Execute os arquivos na ordem correta (schema primeiro, depois funções)
- Faça backup antes de executar scripts de modificação
- Teste em ambiente de desenvolvimento antes de produção

## 📝 Notas

- Arquivos antigos e de teste foram removidos da raiz do projeto
- Mantidos apenas os arquivos essenciais para funcionamento
- Cada arquivo tem comentários explicativos no código
