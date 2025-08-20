# 🎯 INSTRUÇÕES - CONCURSO DO MASCOTE

## 📋 Visão Geral
Sistema de concurso para escolher o nome do mascote da plataforma #20EVSADAY. Usuários logados podem sugerir nomes e visualizar todas as sugestões em tempo real.

## 🚀 Configuração

### 1. **Executar Script SQL**
Execute o arquivo `setup-mascote-contest.sql` no seu banco Supabase:
- Vá para **SQL Editor** no Supabase Dashboard
- Cole o conteúdo do arquivo
- Clique em **Run**
- Aguarde a mensagem de sucesso

### 2. **Verificar Feature Flag**
O recurso está configurado como:
- `enabled: true` - Ativo por padrão
- `requiresDevMenu: true` - Só visível para usuários com acesso Dev
- `productionEnabled: false` - Desabilitado em produção por padrão

### 3. **Localização**
O concurso aparece na **Home page** entre as **Features**, apenas para usuários logados.

## 🎨 Funcionalidades

### **Para Usuários:**
- ✅ Campo de texto para digitar nome (máx. 30 caracteres)
- ✅ Botão de envio com feedback visual
- ✅ Lista de sugestões em tempo real
- ✅ Visual responsivo para mobile
- ✅ Contador de sugestões

### **Para Administradores:**
- ✅ Toggle na área Dev para ativar/desativar
- ✅ Monitoramento de status
- ✅ Controle de visibilidade

## 🔧 Como Usar

### **Habilitar/Desabilitar:**
1. Acesse a página **Dev** (área administrativa)
2. Localize o card **🎯 Concurso do Mascote**
3. Altere o valor em `client/src/utils/featureFlags.js`:
   ```javascript
   MASCOTE_CONTEST: {
     enabled: true,  // true = ativo, false = inativo
     requiresDevMenu: true,
     productionEnabled: false
   }
   ```

### **Personalizar:**
- **Título:** Edite `ContestTitle` no componente
- **Descrição:** Edite `ContestDescription` no componente
- **Estilos:** Modifique os styled-components conforme necessário

## 📱 Design Mobile-First

### **Características:**
- ✅ Grid responsivo para sugestões
- ✅ Input e botão empilhados em telas pequenas
- ✅ Fontes otimizadas para mobile
- ✅ Espaçamentos adaptativos
- ✅ Touch-friendly buttons

### **Breakpoints:**
- **Desktop:** Layout horizontal (input + botão lado a lado)
- **Mobile:** Layout vertical (input acima do botão)
- **Grid:** Adapta automaticamente o número de colunas

## 🗄️ Estrutura do Banco

### **Tabela: `mascote_suggestions`**
```sql
- id: UUID (chave primária)
- name: VARCHAR(100) (nome sugerido)
- user_id: UUID (referência ao usuário)
- username: VARCHAR(255) (apelido do usuário)
- created_at: TIMESTAMPTZ (data de criação)
- updated_at: TIMESTAMPTZ (data de atualização)
```

### **Políticas de Segurança:**
- ✅ Usuários só podem inserir suas próprias sugestões
- ✅ Usuários logados podem ver todas as sugestões
- ✅ Usuários podem editar/deletar apenas suas sugestões
- ✅ RLS (Row Level Security) habilitado

## 🚨 Troubleshooting

### **Problema: Concurso não aparece**
- ✅ Verificar se `enabled: true` no feature flag
- ✅ Verificar se usuário está logado
- ✅ Verificar se usuário tem acesso Dev (se `requiresDevMenu: true`)

### **Problema: Erro ao enviar sugestão**
- ✅ Verificar se tabela foi criada corretamente
- ✅ Verificar se políticas RLS estão ativas
- ✅ Verificar logs do console

### **Problema: Lista não atualiza**
- ✅ Verificar se função `loadSuggestions()` está sendo chamada
- ✅ Verificar se há erros no console
- ✅ Verificar se dados estão chegando do banco

## 📝 Exemplo de Uso

### **Fluxo Completo:**
1. Usuário acessa Home page (logado)
2. Vê o concurso do mascote (se habilitado)
3. Digita nome no campo de texto
4. Clica em "Enviar"
5. Nome é salvo no banco
6. Lista é atualizada automaticamente
7. Nome aparece na grade de sugestões

### **Dados Salvos:**
```json
{
  "id": "uuid-gerado",
  "name": "Nome Sugerido",
  "user_id": "uuid-do-usuario",
  "username": "apelido",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🔄 Atualizações Futuras

### **Possíveis Melhorias:**
- ✅ Sistema de votação para sugestões
- ✅ Moderação de nomes inadequados
- ✅ Limite de sugestões por usuário
- ✅ Categorias de nomes
- ✅ Histórico de vencedores

---

## ✅ Checklist de Configuração

- [ ] Executar script SQL
- [ ] Verificar criação da tabela
- [ ] Verificar políticas RLS
- [ ] Testar inserção de sugestão
- [ ] Testar visualização da lista
- [ ] Testar responsividade mobile
- [ ] Verificar feature flag
- [ ] Testar toggle na área Dev

---

**🎯 Sistema pronto para uso!** O concurso do mascote está configurado e funcionando.
