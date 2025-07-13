# 🚀 Guia de Deploy - EVSADAY

## 📋 Pré-requisitos

1. **Git instalado** no seu computador
2. **Conta no GitHub** criada
3. **Conta na Vercel** conectada ao GitHub

## 🔧 Passo a Passo

### 1. Instalar Git
- Baixe e instale o Git: https://git-scm.com/downloads
- Configure seu usuário:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 2. Inicializar repositório local
```bash
git init
git add .
git commit -m "Initial commit - EVSADAY"
```

### 3. Criar repositório no GitHub
- Acesse: https://github.com/new
- Nome: `20EVSADAY` (ou outro nome)
- Descrição: "Sistema de Estados Vibracionais Gamificado"
- **NÃO** inicialize com README (já temos um)
- Clique em "Create repository"

### 4. Conectar repositório local ao GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/20EVSADAY.git
git branch -M main
git push -u origin main
```

### 5. Deploy na Vercel
- Acesse: https://vercel.com
- Clique em "New Project"
- Importe o repositório `20EVSADAY`
- Configure as variáveis de ambiente:
  - `JWT_SECRET`: sua_chave_secreta_aqui
  - `NODE_ENV`: production
- Clique em "Deploy"

## 🌐 URLs após deploy -teste Rafael
- **Frontend**: https://20evsaday.vercel.app
- **API**: https://20evsaday.vercel.app/api

## 🔒 Variáveis de Ambiente (Vercel)
```env
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
NODE_ENV=production
```

## 📝 Notas Importantes
- O banco SQLite será criado automaticamente
- As rotas da API funcionam em `/api/*`
- O frontend será servido na raiz `/`

## 🐛 Troubleshooting
- Se houver erro de build, verifique se todas as dependências estão no package.json
- Para logs, acesse o dashboard da Vercel
- Para variáveis de ambiente, configure no painel da Vercel 

---

## **Próximos Passos**

### 1. **Pegue as credenciais do Supabase**
- No painel do Supabase, vá em **Settings** > **API**.
- Copie:
  - **Project URL** (ex: `https://xxxx.supabase.co`)
  - **anon public key** (chave pública)

### 2. **Adicione as variáveis no Vercel**
No painel do seu projeto na Vercel:
- Vá em **Settings** > **Environment Variables**
- Adicione:
  - `REACT_APP_SUPABASE_URL` = (cole o Project URL)
  - `REACT_APP_SUPABASE_ANON_KEY` = (cole a anon public key)

### 3. **Configure o Supabase Client no React**
No seu projeto React, crie o arquivo `client/src/supabaseClient.js` com o seguinte conteúdo:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. **Troque as chamadas de API**
- Substitua as chamadas para o backend Express/SQLite por chamadas usando o objeto `supabase`.
- Exemplo para inserir um EV:
  ```js
  const { data, error } = await supabase
    .from('evs')
    .insert([{ user_id, score, notes }]);
  ```

- Exemplo para buscar EVs do usuário:
  ```js
  const { data, error } = await supabase
    .from('evs')
    .select('*')
    .eq('user_id', user_id);
  ```

---

## **Quer um exemplo prático de login, cadastro ou registro de EV usando Supabase no React?**
Me diga qual tela/funcionalidade você quer migrar primeiro e eu te mostro o código!

Se quiser, já pode instalar o Supabase Client no React:
```bash
cd client
npm install @supabase/supabase-js
```

Me avise qual parte quer migrar primeiro (login, cadastro, registro de EV, leaderboard, etc)! 

Ótimo! Você já tem:

- **URL do Supabase:**  
  ```
  https://mbxefiadqcrzqbrfkvxu.supabase.co
  ```
- **Anon Public Key:**  
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieGVmaWFkcWNyenFicmZrdnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDY0NDMsImV4cCI6MjA2Nzk4MjQ0M30.INfILrjycKugM4PdNM8h2uK7U-lOoHD0F-EsuNj581Y
  ```

---

## **Próximos passos:**

### 1. **Adicione essas variáveis no Vercel**
No painel do seu projeto na Vercel:
- Vá em **Settings** > **Environment Variables**
- Adicione:
  - `REACT_APP_SUPABASE_URL` = `https://mbxefiadqcrzqbrfkvxu.supabase.co`
  - `REACT_APP_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieGVmaWFkcWNyenFicmZrdnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDY0NDMsImV4cCI6MjA2Nzk4MjQ0M30.INfILrjycKugM4PdNM8h2uK7U-lOoHD0F-EsuNj581Y`

### 2. **Configure o Supabase Client no React**
No seu projeto, crie (ou edite) o arquivo `client/src/supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. **Instale o Supabase Client**
No terminal, rode:
```bash
cd client
npm install @supabase/supabase-js
```

---

## **Próxima etapa:**
Me diga qual funcionalidade você quer migrar primeiro para o Supabase:
- Cadastro/Login de usuário?
- Registro de EV?
- Listagem de EVs?
- Leaderboard?
- Badges?

Assim eu te passo o exemplo de código para essa tela! 

Ótimo! Vamos migrar **na ordem mais segura**:  
1. Cadastro/Login de usuário  
2. Registro de EV  
3. Listagem de EVs  
4. Leaderboard  
5. Badges

Vamos começar pelo **Cadastro/Login de usuário** usando o Supabase Auth.

---

## 1. **Cadastro e Login de Usuário com Supabase**

### **A) Instale o Supabase Client**
Se ainda não fez:
```bash
cd client
npm install @supabase/supabase-js
```

### **B) Configure o Supabase Client**
No arquivo `client/src/supabaseClient.js`:
```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### **C) Cadastro de Usuário**
No seu componente de cadastro (ex: `Register.js`):

```js
import { supabase } from '../supabaseClient';

async function handleRegister(email, password, nickname) {
  // Cria usuário no Supabase Auth
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname }
    }
  });

  if (error) {
    // Trate o erro (exibir mensagem)
    return { error };
  }

  // Usuário criado! Você pode redirecionar ou exibir mensagem de sucesso
  return { user };
}
```

### **D) Login de Usuário**
No seu componente de login (ex: `Login.js`):

```js
import { supabase } from '../supabaseClient';

async function handleLogin(email, password) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    // Trate o erro (exibir mensagem)
    return { error };
  }

  // Login realizado! Você pode redirecionar ou salvar o usuário no contexto
  return { user };
}
```

### **E) Obter usuário logado**
```js
const { data: { user } } = await supabase.auth.getUser();
```

---

## **Próximo passo**
- Implemente o cadastro e login usando os exemplos acima.
- Teste se o fluxo de autenticação funciona.
- Me avise se quiser um exemplo de componente React pronto ou se tiver dúvidas sobre integração com o contexto de autenticação!

Assim que o login/cadastro estiver funcionando, seguimos para o registro de EV! 

---

## **Como resolver o erro 500 e fazer deploy só do frontend**

### 1. **Remova o backend do deploy**
- No seu projeto, remova a pasta `server` ou, pelo menos, remova o arquivo `server/index.js` do build/deploy.
- Remova ou ajuste o arquivo `vercel.json` para que só o frontend seja servido.

### 2. **Ajuste o `vercel.json` para um projeto React estático**
Substitua o conteúdo do `vercel.json` por:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/client/build/index.html" }
  ]
}
```

### 3. **Configure o build na Vercel**
- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/build`
- **Install Command:** `cd client && npm install`

### 4. **Garanta as variáveis de ambiente do Supabase**
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

### 5. **Faça o deploy novamente**
- Faça push das alterações para o GitHub.
- Acesse a Vercel e clique em **Redeploy**.

---

## **Resumo**
- O erro 500 é porque o backend está tentando rodar na Vercel (o que não é mais necessário).
- O frontend React pode ser deployado sozinho, consumindo o Supabase diretamente.

---

Se quiser, posso te passar exatamente o que remover/alterar no seu projeto para garantir que só o frontend seja deployado!  
Me avise se quer um passo a passo detalhado para isso. 