# 🔐 Fluxo de Autenticação com Google OAuth

## 📋 Visão Geral

O sistema implementa autenticação via Google OAuth com redirect inteligente, permitindo que usuários voltem para a página que tentavam acessar após o login.

---

## 🔄 Fluxo Completo

### **1️⃣ Usuário tenta acessar página protegida**

```
Usuário acessa: /diets (sem estar logado)
```

**O que acontece:**
- `ProtectedRoute` detecta `isAuthenticated = false`
- Como `redirectToGoogle={true}`, redireciona direto para OAuth
- URL gerada: `BASE_API_URL/auth/google?redirect=/diets`

---

### **2️⃣ Backend processa OAuth com Google**

```
Backend recebe: /auth/google?redirect=/diets
  ↓
Redireciona usuário para Google
  ↓
Google autentica e retorna para backend
  ↓
Backend gera token JWT
```

---

### **3️⃣ Backend redireciona para frontend**

**Seu backend deve redirecionar para:**

```
FRONTEND_URL/auth/callback?token=JWT_TOKEN&redirect=/diets&user=USER_JSON
```

**Parâmetros esperados:**
- `token` (obrigatório): JWT token gerado
- `redirect` (obrigatório): Página que o usuário queria acessar
- `user` (opcional): JSON com dados do usuário (encodeURIComponent)
- `error` (opcional): Mensagem de erro se algo falhou

**Exemplo real:**
```
http://localhost:5173/auth/callback?token=eyJhbGc...&redirect=/diets&user=%7B%22id%22%3A1%2C%22name%22%3A%22Lucas%22%7D
```

---

### **4️⃣ Frontend processa callback**

**Página `/auth/callback` (`AuthCallback.tsx`):**

```typescript
1. Extrai token, user e redirect da URL
2. Salva no localStorage:
   - ideias-token
   - ideias-user (se fornecido)
3. Redireciona para a página original (/diets)
4. AuthContext detecta token e autentica automaticamente
```

---

### **5️⃣ Usuário acessa página protegida**

```
Agora em /diets (com token)
  ↓
ProtectedRoute verifica: isAuthenticated = true ✅
  ↓
Renderiza <Diet />
  ↓
Todas as requisições incluem: Authorization: Bearer TOKEN
```

---

## 🎯 Configuração do Backend

### **Endpoint de início do OAuth**

```typescript
// GET /auth/google
app.get('/auth/google', (req, res) => {
  const redirectPage = req.query.redirect || '/'
  
  // Salvar redirect em session/state para usar depois
  req.session.redirectPage = redirectPage
  
  // Redirecionar para Google OAuth
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?...`
  res.redirect(googleAuthUrl)
})
```

### **Callback do Google**

```typescript
// GET /auth/google/callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    // 1. Trocar code por token do Google
    const googleUser = await getGoogleUser(req.query.code)
    
    // 2. Criar/buscar usuário no banco
    const user = await findOrCreateUser(googleUser)
    
    // 3. Gerar JWT
    const token = generateJWT(user)
    
    // 4. Pegar página de redirect salva
    const redirectPage = req.session.redirectPage || '/'
    
    // 5. Redirecionar para frontend
    const frontendUrl = process.env.FRONTEND_URL
    const userJson = encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    }))
    
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&redirect=${redirectPage}&user=${userJson}`
    )
  } catch (error) {
    res.redirect(
      `${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message)}`
    )
  }
})
```

---

## 🛠️ Como Usar em Outras Páginas

### **Redirect direto para Google (recomendado para páginas sensíveis)**

```tsx
<Route 
  path="/minha-pagina" 
  element={
    <ProtectedRoute redirectToGoogle={true}>
      <MinhaPagina />
    </ProtectedRoute>
  } 
/>
```

### **Redirect para página de login interna (mais flexível)**

```tsx
<Route 
  path="/outra-pagina" 
  element={
    <ProtectedRoute redirectToGoogle={false}>
      <OutraPagina />
    </ProtectedRoute>
  } 
/>
```

Ou simplesmente (default é false):
```tsx
<Route 
  path="/outra-pagina" 
  element={
    <ProtectedRoute>
      <OutraPagina />
    </ProtectedRoute>
  } 
/>
```

---

## 🧪 Testando

### **1. Testar sem autenticação**
```bash
# Limpar localStorage
localStorage.clear()

# Acessar página protegida
http://localhost:5173/diets

# Deve redirecionar para:
BASE_API_URL/auth/google?redirect=%2Fdiets
```

### **2. Simular callback manual**
```bash
# Simular retorno do backend
http://localhost:5173/auth/callback?token=fake-token-123&redirect=/diets
```

### **3. Verificar token nas requisições**
```bash
# Abrir DevTools > Network
# Fazer qualquer requisição
# Verificar header:
Authorization: Bearer fake-token-123
```

---

## ⚠️ Tratamento de Erros

### **Token inválido/expirado**
- Interceptor detecta 401
- Limpa localStorage
- Redireciona para `/modelos/login`

### **Erro no callback do Google**
- Backend redireciona com `?error=mensagem`
- Frontend mostra alert e redireciona para login

### **Usuário cancela login no Google**
- Google redireciona de volta com erro
- Backend repassa erro para frontend
- Usuário vê mensagem e pode tentar novamente

---

## 🔒 Segurança

✅ **Token no localStorage**: Aceito para SPAs modernas
✅ **HTTPS obrigatório**: Em produção
✅ **Token expiration**: Backend deve implementar
✅ **Refresh token**: Recomendado para longa duração
✅ **CORS configurado**: Backend deve permitir frontend origin
✅ **State parameter**: Previne CSRF no OAuth

---

## 📝 Variáveis de Ambiente

**Frontend (.env)**
```bash
VITE_BASE_URL_API=http://localhost:3000
```

**Backend**
```bash
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```
