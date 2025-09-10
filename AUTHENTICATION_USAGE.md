# 🔐 Sistema de Autenticação - Guia de Uso

## 📋 Visão Geral

Sistema de autenticação JWT completo implementado com:

- ✅ **Autenticação JWT**: Tokens de acesso e renovação
- ✅ **Controle de Sessão Única**: Previne compartilhamento de senhas
- ✅ **Rate Limiting**: Proteção contra ataques de força bruta
- ✅ **Autorização por Papéis**: ADMIN, CHEFE, BOMBEIRO
- ✅ **Middleware de Segurança**: Proteção automática de rotas

## 🚀 Rotas de Autenticação

### 1. Login (POST /auth/login)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "rg": 12345678,
    "password": "minhasenha123",
    "deviceInfo": "Chrome/Windows"
  }'
```

**Resposta de Sucesso:**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-123",
      "militaryId": "militar-456",
      "role": "ADMIN"
    },
    "expiresIn": 900
  }
}
```

### 2. Renovar Token (POST /auth/refresh-token)

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 3. Logout (POST /auth/logout)

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🛡️ Middleware de Segurança

### Tipos de Proteção Disponíveis:

#### 1. `requireAuth` - Autenticação Obrigatória

```typescript
// Qualquer usuário autenticado pode acessar
userRoutes.patch("/user/update-password/:id", requireAuth, controller);
```

#### 2. `requireAuthWithRoles` - Autenticação + Autorização

```typescript
// Apenas ADMIN pode acessar
userRoutes.post("/user", requireAuthWithRoles(["ADMIN"]), controller);

// ADMIN ou CHEFE podem acessar
userRoutes.get("/user", requireAuthWithRoles(["ADMIN", "CHEFE"]), controller);
```

#### 3. `requireRoles` - Apenas Autorização (após auth)

```typescript
// Usado quando autenticação já foi feita anteriormente
userRoutes.delete(
  "/user/:id",
  requireAuth,
  requireRoles(["ADMIN"]),
  controller,
);
```

## 🏗️ Estrutura de Permissões Implementada

### Rotas de Usuário (`/user`)

- **POST /user** → `requireAuthWithRoles(["ADMIN"])` - Criar usuários
- **DELETE /user/:id** → `requireAuthWithRoles(["ADMIN"])` - Deletar usuários
- **PATCH /user/update-role/:id** → `requireAuthWithRoles(["ADMIN"])` - Alterar papel
- **GET /user** → `requireAuthWithRoles(["ADMIN", "CHEFE"])` - Listar usuários
- **GET /user/:id** → `requireAuthWithRoles(["ADMIN", "CHEFE"])` - Ver usuário específico
- **PATCH /user/update-password/:id** → `requireAuth` - Atualizar própria senha

### Rotas de Militar (`/military`)

- **POST /military** → `requireAuthWithRoles(["ADMIN"])` - Criar militar
- **DELETE /military/:id** → `requireAuthWithRoles(["ADMIN"])` - Deletar militar
- **PUT /military/:id** → `requireAuthWithRoles(["ADMIN"])` - Atualizar militar
- **GET /military** → `requireAuthWithRoles(["ADMIN", "CHEFE"])` - Listar militares
- **GET /military/:id** → `requireAuthWithRoles(["ADMIN", "CHEFE"])` - Ver militar específico

## 🔒 Controle de Sessão Única

**Comportamento:**

- Quando um usuário faz login, todas as sessões ativas anteriores são invalidadas
- Previne que a mesma conta seja usada em múltiplos dispositivos simultaneamente
- Garante que senhas não sejam compartilhadas

**Exemplo:**

1. Usuário faz login no computador A → Sessão 1 criada
2. Usuário faz login no computador B → Sessão 1 invalidada, Sessão 2 criada
3. Tentativa de usar token da Sessão 1 → **401 Unauthorized**

## ⚡ Rate Limiting

**Proteção Implementada:**

- **Por IP**: 10 tentativas a cada 15 minutos
- **Por RG**: 5 tentativas a cada 15 minutos por usuário
- **Reset Automático**: Após login bem-sucedido

**Exemplo de Resposta (Limite Excedido):**

```json
{
  "error": "Muitas tentativas de login. Tente novamente em 12 minutos."
}
```

## 🛠️ Implementação Técnica

### Factory Pattern Implementado:

```typescript
// Services
makeAuthService();
makeJWTService();
makeRateLimiterService();
makeSessionRepository();

// Controllers
makeLoginController();
makeLogoutController();
makeRefreshTokenController();

// Middlewares
makeAuthMiddleware();
```

### Estrutura de Arquivos:

```
src/
├── application/services/auth/
│   ├── auth.service.ts
│   ├── jwt.service.ts
│   └── rate-limiter.service.ts
├── presentation/
│   ├── controllers/auth/
│   └── middlewares/auth.middleware.ts
├── main/
│   ├── factories/
│   ├── middlewares/auth.middleware.helper.ts
│   └── routes/auth.routes.ts
└── infra/repositories/in-memory/
    └── session.repository.in-memory.ts
```

## 🚦 Status de Headers HTTP

### Códigos de Resposta:

- **200**: Login/logout/refresh bem-sucedido
- **401**: Token inválido, expirado ou sessão inativa
- **403**: Usuário não tem permissão (papel insuficiente)
- **429**: Rate limiting ativo (muitas tentativas)

### Headers de Autenticação:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 🔧 Variáveis de Ambiente

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secure-access-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## 📝 Logs de Segurança

O sistema registra automaticamente:

- Tentativas de login (sucesso/falha)
- Tokens renovados
- Sessões invalidadas por IP divergente
- Rate limiting ativado
- Acessos negados por permissão

**Exemplo de Log:**

```
[INFO] Login realizado com sucesso { userId: "123", role: "ADMIN", ip: "192.168.1.1" }
[WARN] Acesso negado - papel insuficiente { userId: "456", userRole: "BOMBEIRO", requiredRoles: ["ADMIN"] }
```

## 🎯 Exemplo de Uso Completo

```typescript
// 1. Login
const loginResponse = await fetch("/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ rg: 12345678, password: "senha123" }),
});

const { data } = await loginResponse.json();
const { accessToken, refreshToken } = data;

// 2. Usar token em requisições protegidas
const userResponse = await fetch("/user", {
  headers: { Authorization: `Bearer ${accessToken}` },
});

// 3. Renovar token quando necessário
const refreshResponse = await fetch("/auth/refresh-token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ refreshToken }),
});

// 4. Logout
await fetch("/auth/logout", {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

---

🔐 **Sistema implementado com foco em segurança, prevenindo ataques comuns e garantindo controle granular de acesso.**
