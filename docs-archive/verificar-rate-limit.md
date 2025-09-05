# 🔧 Rate Limit do Supabase - Soluções

## 🚫 Problema: "Email rate limit exceeded"

### **Causas:**
- Muitas tentativas de registro em pouco tempo
- Rate limit padrão: 5 tentativas por minuto
- Rate limit por IP e por email

## 🔧 Soluções Imediatas

### **1. Aguardar (Mais Simples)**
```
⏰ Aguarde 1-2 minutos
🔄 Tente novamente
```

### **2. Usar Email Diferente**
```
📧 Email 1: teste@exemplo.com
📧 Email 2: teste2@exemplo.com  
📧 Email 3: usuario.teste@gmail.com
📧 Email 4: test.user@outlook.com
```

### **3. Limpar Rate Limit (Admin)**
- **Acesse**: https://supabase.com/dashboard/project/mbxefiadqcrzqbrfkvxu
- **Vá para**: Authentication → Users
- **Procure** por usuários não confirmados
- **Delete** usuários de teste antigos

## 🎯 Teste Alternativo

### **Usar Email Real Temporário:**
```
📧 10minutemail.com
📧 temp-mail.org
📧 guerrillamail.com
```

### **Ou usar seu email real:**
```
📧 rafaguipe1402@gmail.com
💡 Depois você pode deletar o usuário
```

## ⚙️ Configurações de Rate Limit

### **Verificar no Supabase:**
- **Vá para**: Authentication → Settings → Auth
- **Procure** por configurações de rate limiting
- **Ajuste** se necessário (se tiver acesso)

### **Configurações Padrão:**
```
📧 Email confirmations: 5/min
🔐 Password reset: 5/min
📝 Sign ups: 5/min
```

## 🚀 Próximos Passos

1. **Aguarde 2 minutos**
2. **Tente com email diferente**
3. **Se funcionar, configure SMTP depois**
4. **Se não funcionar, use email temporário**

## 💡 Dica

**Para desenvolvimento/teste:**
- Use emails temporários
- Delete usuários de teste depois
- Configure SMTP apenas para produção 