# 🔧 Alterações Necessárias na Navbar

## ✅ Alterações Realizadas:

### 1. ✅ Navbar.js - Simplificações:
- ✅ Removido texto "#20EVSADAY" do logo
- ✅ Alterado "💬 Chat EV" para "Chat"
- ✅ Mantido apenas o logotipo (figura)

### 2. ✅ Loja.js - Nova Página:
- ✅ Criada página Loja similar à Multimidia
- ✅ Thumbnail do Workshop Jogos Evolutivos
- ✅ Link para Sympla: https://www.sympla.com.br/evento-online/workshop-jogos-evolutivos-jogos-eletronicos-online/2991500

## 🔧 Alterações Pendentes:

### 3. App.js - Rotas:
```javascript
// Adicionar import
import Loja from './pages/Loja';

// Alterar rota do chat
<Route path="/chat" element={<ProtectedRoute><ChatEV /></ProtectedRoute>} />

// Adicionar rota da loja
<Route path="/loja" element={<Loja />} />
```

### 4. Navbar.js - Link da Loja:
```javascript
// Adicionar antes do Multimídia
<NavLink to="/loja" active={isActive('/loja')}>
  Loja
</NavLink>
```

### 5. Imagem do Workshop:
- ✅ Adicionar imagem: `/assets/workshop-jogos-evolutivos.jpg`
- ✅ Ou usar placeholder: `/assets/placeholder-workshop.jpg`

## 🎯 Resultado Final:
- ✅ Navbar mais limpa
- ✅ Chat simplificado
- ✅ Nova aba Loja
- ✅ Workshop Jogos Evolutivos destacado 