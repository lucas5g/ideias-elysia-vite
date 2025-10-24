# 🔐 Implementação Correta do Google OAuth no Backend

## ❌ Problema Identificado

O Google OAuth **NÃO aceita** query parameters no `redirect_uri`:

```typescript
// ERRADO ❌
redirect_uri: http://localhost:3000/auth/google/callback?redirect=/diets
```

**Erro do Google:**
> "You can't sign in because Ideias sent an invalid request"

---

## ✅ Solução - Usar `state` Parameter

O OAuth 2.0 fornece o parâmetro `state` exatamente para isso!

### **1️⃣ Endpoint Inicial - `/auth/google`**

```typescript
// Elysia.js / Bun
app.get('/auth/google', ({ query, set }) => {
  // Pegar o redirect que veio do frontend
  const frontendRedirect = query.redirect || '/'

  // Codificar o redirect no state (pode ser JSON se precisar de mais dados)
  const state = Buffer.from(JSON.stringify({
    redirect: frontendRedirect,
    timestamp: Date.now() // Opcional: para validar freshness
  })).toString('base64')

  // Configurar URL do Google OAuth
  const redirectUri = `${process.env.BASE_URL_API}/auth/google/callback`
  const clientId = process.env.GOOGLE_CLIENT_ID
  const scope = 'openid profile email'

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri) // SEM query params!
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', scope)
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent')
  googleAuthUrl.searchParams.set('state', state) // 👈 AQUI está o redirect!

  set.redirect = googleAuthUrl.toString()
})
```

---

### **2️⃣ Callback do Google - `/auth/google/callback`**

```typescript
app.get('/auth/google/callback', async ({ query, set }) => {
  try {
    const { code, state, error } = query

    // Se Google retornou erro
    if (error) {
      const frontendUrl = process.env.FRONTEND_URL
      set.redirect = `${frontendUrl}/auth/callback?error=${encodeURIComponent(error)}`
      return
    }

    // Decodificar o state para pegar o redirect original
    const decodedState = JSON.parse(
      Buffer.from(state as string, 'base64').toString('utf-8')
    )
    const frontendRedirect = decodedState.redirect || '/'

    // 1. Trocar code por token do Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.BASE_URL_API}/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    // 2. Buscar dados do usuário no Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    })

    const googleUser = await userResponse.json()

    // 3. Criar/atualizar usuário no banco de dados
    const user = await db.user.upsert({
      where: { email: googleUser.email },
      create: {
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.id,
        picture: googleUser.picture
      },
      update: {
        name: googleUser.name,
        picture: googleUser.picture
      }
    })

    // 4. Gerar JWT com dados do usuário
    const jwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name
    }

    const token = await sign(jwtPayload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    })

    // 5. Redirecionar para o frontend com token E o redirect original
    const frontendUrl = process.env.FRONTEND_URL
    set.redirect = `${frontendUrl}/auth/callback?token=${token}&redirect=${encodeURIComponent(frontendRedirect)}`

  } catch (error) {
    console.error('Erro no callback do Google:', error)
    const frontendUrl = process.env.FRONTEND_URL
    set.redirect = `${frontendUrl}/auth/callback?error=${encodeURIComponent('Erro ao processar login')}`
  }
})
```

---

## 🔄 Fluxo Completo Atualizado

```
1. Frontend: Usuário acessa /diets (sem auth)
   ↓
2. Frontend redireciona para:
   GET http://localhost:3000/auth/google?redirect=/diets
   ↓
3. Backend codifica redirect no state e redireciona para Google:
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=...
     redirect_uri=http://localhost:3000/auth/google/callback
     state=eyJyZWRpcmVjdCI6Ii9kaWV0cyJ9  👈 /diets codificado aqui
   ↓
4. Google autentica usuário e redireciona PARA O BACKEND:
   GET http://localhost:3000/auth/google/callback?
     code=4/abc123...
     state=eyJyZWRpcmVjdCI6Ii9kaWV0cyJ9  👈 State volta
   ↓
5. Backend:
   - Decodifica state → pega /diets
   - Troca code por access_token
   - Busca dados do usuário
   - Gera JWT
   - Redireciona para frontend:
     http://localhost:5173/auth/callback?
       token=eyJhbGc...
       redirect=/diets  👈 Redirect preservado!
   ↓
6. Frontend processa callback e redireciona para /diets
```

---

## 🔑 Variáveis de Ambiente Necessárias

### **Backend (.env)**

```bash
# URLs
BASE_URL_API=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-seu-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT
JWT_SECRET=sua-chave-secreta-super-segura

# Database (exemplo)
DATABASE_URL=postgresql://...
```

### **Frontend (.env)**

```bash
VITE_BASE_URL_API=http://localhost:3000
```

---

## 🛡️ Segurança Adicional (Opcional)

### **Validar timestamp do state:**

```typescript
// No callback
const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
const { redirect, timestamp } = decodedState

// Verificar se state não expirou (ex: 5 minutos)
const fiveMinutes = 5 * 60 * 1000
if (Date.now() - timestamp > fiveMinutes) {
  throw new Error('State expirado')
}
```

### **Adicionar CSRF token:**

```typescript
// Ao criar state
const state = Buffer.from(JSON.stringify({
  redirect: frontendRedirect,
  csrf: generateRandomString() // Salvar em session/redis
})).toString('base64')

// Ao validar
const { csrf } = decodedState
if (!isValidCSRF(csrf)) {
  throw new Error('CSRF inválido')
}
```

---

## 🧪 Como Testar

1. **Acessar URL inicial:**
   ```
   http://localhost:3000/auth/google?redirect=/diets
   ```

2. **Verificar redirect para Google:**
   - Deve ter `state=` na URL
   - NÃO deve ter query params no `redirect_uri`

3. **Após autenticar no Google:**
   - Volta para seu backend callback
   - Backend redireciona para frontend
   - Frontend processa e vai para /diets

---

## 📦 Exemplo com Elysia.js Completo

```typescript
import { Elysia } from 'elysia'
import { sign } from 'hono/jwt'

const app = new Elysia()
  .get('/auth/google', ({ query, set }) => {
    const state = Buffer.from(JSON.stringify({
      redirect: query.redirect || '/'
    })).toString('base64')

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
    url.searchParams.set('redirect_uri', `${process.env.BASE_URL_API}/auth/google/callback`)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid profile email')
    url.searchParams.set('state', state)

    set.redirect = url.toString()
  })
  
  .get('/auth/google/callback', async ({ query, set }) => {
    // ... implementação do callback acima
  })

app.listen(3000)
```

---

## ✅ Checklist Final

- [ ] `redirect_uri` no Google NÃO tem query parameters
- [ ] Redirect do frontend vai no `state` parameter (base64)
- [ ] State é decodificado no callback
- [ ] JWT é gerado com dados do usuário
- [ ] Frontend recebe `?token=...&redirect=...`
- [ ] Google Console tem callback URI correto configurado

---

## 🔗 Configuração no Google Console

1. Acesse: https://console.cloud.google.com/
2. Vá em: **APIs & Services** > **Credentials**
3. Crie **OAuth 2.0 Client ID**
4. Em **Authorized redirect URIs**, adicione:
   ```
   http://localhost:3000/auth/google/callback
   https://api.seudominio.com/auth/google/callback (produção)
   ```
   ⚠️ **SEM query parameters!**

---

Isso resolve o problema! 🚀
