# API Routes - Sistema de Versionamento

## Estrutura Atual

Todas as rotas da API seguem o padrão de versionamento:

```
/api/v1/<recurso>/<ação>
```

### Versão Atual: v1

A versão atual da API é gerenciada centralmente no arquivo `api-version.ts`.

## Como Funciona

### 1. Configuração Centralizada

O arquivo `api-version.ts` define:
- Versão atual da API (`API_VERSION`)
- Prefixo base (`API_BASE_PATH`)
- Prefixo versionado completo (`API_VERSIONED_PATH`)

```typescript
export const API_VERSION = "v1";
export const API_BASE_PATH = "/api";
export const API_VERSIONED_PATH = "/api/v1";
```

### 2. Registro de Rotas

No arquivo `index.ts`, todas as rotas são registradas com o prefixo versionado:

```typescript
routes.use(API_VERSIONED_PATH, authRoutes);
routes.use(API_VERSIONED_PATH, userRoutes);
// etc...
```

### 3. Endpoints Disponíveis

#### Autenticação (`/api/v1`)
- `POST /api/v1/login` - Login de usuário
- `POST /api/v1/logout` - Logout (protegido)
- `POST /api/v1/refresh-token` - Renovação de token

#### Usuários (`/api/v1/users`)
- `GET /api/v1/users` - Listar usuários
- `GET /api/v1/users/:id` - Buscar usuário por ID
- `POST /api/v1/users` - Criar usuário
- `DELETE /api/v1/users/:id` - Deletar usuário
- `PATCH /api/v1/users/:id/password` - Atualizar senha
- `PATCH /api/v1/users/:id/role` - Atualizar role

#### Militares (`/api/v1/militaries`)
- `GET /api/v1/militaries` - Listar militares
- `GET /api/v1/militaries/:id` - Buscar militar por ID
- `POST /api/v1/militaries` - Criar militar
- `PUT /api/v1/militaries/:id` - Atualizar militar
- `DELETE /api/v1/militaries/:id` - Deletar militar

#### Postos/Graduações (`/api/v1/military-ranks`)
- `GET /api/v1/military-ranks` - Listar postos
- `GET /api/v1/military-ranks/:id` - Buscar posto por ID
- `POST /api/v1/military-ranks` - Criar posto
- `PUT /api/v1/military-ranks/:id` - Atualizar posto
- `DELETE /api/v1/military-ranks/:id` - Deletar posto

#### Veículos (`/api/v1/vehicles`)
- `GET /api/v1/vehicles` - Listar veículos
- `GET /api/v1/vehicles/:id` - Buscar veículo por ID
- `POST /api/v1/vehicles` - Criar veículo
- `PUT /api/v1/vehicles/:id` - Atualizar veículo
- `DELETE /api/v1/vehicles/:id` - Deletar veículo

## Como Criar uma Nova Versão da API (v2)

Quando for necessário criar uma nova versão da API mantendo a v1 ativa:

### Opção 1: Manter v1 e v2 Simultaneamente

1. **Duplicar estrutura de rotas**:
   ```
   src/main/routes/
   ├── v1/
   │   ├── auth.routes.ts
   │   ├── user.routes.ts
   │   └── ...
   └── v2/
       ├── auth.routes.ts
       ├── user.routes.ts
       └── ...
   ```

2. **Atualizar `index.ts`**:
   ```typescript
   import v1Routes from "./v1";
   import v2Routes from "./v2";

   routes.use("/api/v1", v1Routes);
   routes.use("/api/v2", v2Routes);
   ```

### Opção 2: Migração Completa para v2

1. **Atualizar `api-version.ts`**:
   ```typescript
   export const API_VERSION = "v2";
   ```

2. Todas as rotas automaticamente mudam para `/api/v2`

## Boas Práticas

1. **Nunca quebrar compatibilidade na mesma versão** - Se uma mudança quebra contratos existentes, crie uma nova versão
2. **Documentar mudanças entre versões** - Manter changelog de breaking changes
3. **Depreciar antes de remover** - Avisar clientes com antecedência antes de remover v1
4. **Headers de versionamento** - Considerar adicionar header `X-API-Version` nas respostas

## Configuração de Servidor

O servidor exibe a versão atual no log de inicialização:

```
✅ Server is running at http://localhost:3333/api/v1
```

Porta e host são configuráveis via variáveis de ambiente:
- `PORT` - Porta do servidor (padrão: 3333)
- `SERVER_HOST` - Host para logging (padrão: http://localhost)
