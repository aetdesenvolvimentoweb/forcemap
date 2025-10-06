# Análise Detalhada das Recomendações de Segurança

## 1. 🛡️ Helmet.js - Vale a Pena?

### O que é?
Helmet.js é uma coleção de 15 middlewares Express que configuram headers HTTP de segurança automaticamente.

### Comparação: Sua Implementação vs Helmet.js

**Você já implementou (src/infra/adapters/middlewares/express-security.middleware.ts):**
- ✅ HSTS (Strict-Transport-Security)
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ✅ Remove X-Powered-By

**Helmet.js adiciona:**
- Cross-Origin-Embedder-Policy (COEP)
- Cross-Origin-Opener-Policy (COOP)
- Cross-Origin-Resource-Policy (CORP)
- Origin-Agent-Cluster
- X-DNS-Prefetch-Control
- X-Download-Options
- X-Permitted-Cross-Domain-Policies

### Veredito
**NÃO PRECISA INSTALAR HELMET.JS**

**Motivos:**
1. Sua implementação customizada é **mais flexível** e configurável
2. Você já cobre **todos os headers críticos** (OWASP recomendados)
3. Headers extras do Helmet são úteis apenas para:
   - Sites que embedam conteúdo externo (COEP/COOP/CORP)
   - Aplicações com iframes complexos
   - Browsers muito antigos (X-Download-Options é IE8)

4. Sua implementação tem **controle total** via ENV
5. **Menos dependências** = menor superfície de ataque

**Recomendação:** Manter sua implementação atual. Helmet seria redundante.

---

## 2. 🍪 CSRF Protection - Você Precisa?

### Contexto da Sua API
Você mencionou: "A API não criará cookies, o frontend gerenciará sessões"

### Quando CSRF é Necessário

**CSRF ataca quando:**
- Navegador envia cookies automaticamente
- Autenticação baseada em **sessão com cookies**
- Backend cria e valida cookies de sessão

**Você usa:**
- ✅ JWT no header `Authorization: Bearer <token>`
- ✅ Token **não é cookie**, não é enviado automaticamente
- ✅ Frontend armazena token (localStorage/sessionStorage)
- ✅ Frontend envia explicitamente no header

### Veredito
**NÃO PRECISA DE CSRF PROTECTION**

**Motivos:**
1. JWT em header Authorization **não é vulnerável a CSRF**
2. CSRF explora envio automático de cookies - você não usa cookies de sessão
3. Seu refresh token também é JWT (não cookie)

**Exceção:** Se no futuro você decidir usar `httpOnly cookies` para tokens (mais seguro contra XSS), aí sim precisaria de CSRF.

### Implementação Futura (se usar cookies)
```typescript
// Se um dia usar cookies httpOnly:
app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Frontend enviaria:
headers: {
  'X-CSRF-Token': token
}
```

**Recomendação atual:** Não implementar. Seu design de autenticação já é seguro.

---

## 3. 📋 npm audit - O que agrega?

### O que é npm audit?

Ferramenta que **escaneia dependências** em busca de vulnerabilidades conhecidas no banco de dados do npm.

### Como Funciona

```bash
# Executar manualmente
npm audit

# Exemplo de saída:
# found 3 vulnerabilities (1 moderate, 2 high)
# run `npm audit fix` to fix them
```

### Integração com Husky

**Arquivo `.husky/pre-commit` (atualizado):**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Lint e testes (você já tem)
npm run lint
npm run test:staged

# Adicionar: Verificar vulnerabilidades
npm audit --audit-level=high
# Se encontrar vulnerabilidades HIGH ou CRITICAL, bloqueia commit
```

### Onde Adicionar

**Opção 1: Pre-commit (mais rigoroso)**
- Bloqueia commits se houver vulnerabilidades
- Pode ser chato em desenvolvimento

**Opção 2: CI/CD (recomendado)**
- Roda no GitHub Actions/GitLab CI
- Não atrapalha desenvolvimento local
- Bloqueia merge se houver vulnerabilidades

**Exemplo de GitHub Actions:**
```yaml
# .github/workflows/security.yml
name: Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=moderate
```

### Veredito
**VALE MUITO A PENA - Implementar no CI/CD**

**Benefícios:**
- ✅ Detecta vulnerabilidades conhecidas
- ✅ Gratuito e built-in no npm
- ✅ Atualiza automaticamente o banco de dados
- ✅ Mostra severidade e fix disponível

**Recomendação:** Adicionar no CI/CD, não no pre-commit (menos intrusivo).

---

## 4. 🔐 Secrets Manager - É uma lib?

### O que é?

**NÃO é uma lib**, são **serviços de cloud** que armazenam secrets de forma segura.

### Por que não usar .env em produção?

**Problemas do .env:**
- ❌ Arquivo commitado acidentalmente (exposição)
- ❌ Sem auditoria de quem acessou
- ❌ Sem rotação automática de secrets
- ❌ Sem criptografia at-rest
- ❌ Secrets em plain text no servidor

### Opções de Secrets Manager

#### **1. AWS Secrets Manager**
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getSecret(secretName: string) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return JSON.parse(response.SecretString);
}

// Uso:
const secrets = await getSecret("forcemap/production");
const jwtSecret = secrets.JWT_ACCESS_SECRET;
```

**Custo:** $0.40/secret/mês + $0.05 por 10k chamadas

#### **2. HashiCorp Vault** (self-hosted ou cloud)
```bash
# Armazenar
vault kv put secret/forcemap/jwt access_secret="..."

# Ler no código
const secret = await vault.read('secret/forcemap/jwt');
```

**Custo:** Grátis (self-hosted) ou $0.03/hora (HCP Vault)

#### **3. Google Cloud Secret Manager**
```typescript
const [version] = await client.accessSecretVersion({
  name: 'projects/PROJECT_ID/secrets/JWT_SECRET/versions/latest',
});
const secret = version.payload.data.toString();
```

**Custo:** $0.06/secret/mês + $0.03 por 10k acessos

#### **4. Azure Key Vault**
```typescript
const credential = new DefaultAzureCredential();
const client = new SecretClient(vaultUrl, credential);
const secret = await client.getSecret("JWT-ACCESS-SECRET");
```

**Custo:** $0.03/10k operações

### Veredito
**IMPLEMENTAR QUANDO EM PRODUÇÃO (não agora)**

**Recomendação:**
- ✅ Desenvolvimento/Staging: Continuar usando .env
- ✅ Produção: Usar secrets manager da sua cloud
- ✅ Se usar Docker: Pode usar Docker Secrets (gratuito)

**Quando implementar:**
- Quando tiver servidor de produção definido
- Ao fazer deploy real
- Ao ter múltiplos ambientes (prod/staging)

---

## 5. 📊 Pino - Já está sendo usado?

### Análise do Código Atual

**Você TEM o Pino implementado:**
- ✅ `src/infra/adapters/pino.logger.adapter.ts` - Wrapper do Pino
- ✅ Injetado em todos os controllers via BaseController
- ✅ Usado em: login, logout, refresh-token, CRUD operations

**Mas também usa console.log em:**

#### 1. **express-security-logger.middleware.ts (linhas 85-199)**
```typescript
class ConsoleSecurityLogger implements SecurityLogger {
  logSecurityEvent(event: SecurityEvent): void {
    const logMethod = this.getLogMethod(event.severity);
    logMethod(`🔒 [SECURITY] ${this.formatSecurityLog(event)}`); // ← console
  }
}
```

#### 2. **express-cors.middleware.ts (linha 210)**
```typescript
console.warn(`🚫 CORS: Origem bloqueada - ${origin}...`); // ← console
```

#### 3. **server.ts (linha 37)**
```typescript
console.log(`✅ Server is running at ${host}:${port}/api/v1`); // ← console
```

#### 4. **express-seed.middleware.ts**
```typescript
console.log("🌱 Initializing seed..."); // ← console
```

### Veredito
**SIM, HÁ PARTES USANDO console.log**

**Recomendação:** Migrar tudo para Pino.

### Como Migrar?

**1. Criar Logger de Segurança com Pino:**

```typescript
// src/infra/adapters/middlewares/pino-security-logger.middleware.ts
import { LoggerProtocol } from "../../../application/protocols";

export class PinoSecurityLogger implements SecurityLogger {
  constructor(private readonly logger: LoggerProtocol) {}

  logSecurityEvent(event: SecurityEvent): void {
    const logLevel = this.mapSeverityToLevel(event.severity);
    this.logger[logLevel](`[SECURITY] ${event.message}`, {
      type: "SECURITY_EVENT",
      ...event,
    });
  }

  private mapSeverityToLevel(severity: SecurityEventSeverity) {
    switch (severity) {
      case SecurityEventSeverity.LOW: return 'info';
      case SecurityEventSeverity.MEDIUM: return 'warn';
      case SecurityEventSeverity.HIGH:
      case SecurityEventSeverity.CRITICAL: return 'error';
    }
  }
}
```

**2. Atualizar server.ts:**
```typescript
import { makePinoLogger } from "./factories/logger";

const logger = makePinoLogger();

if (process.env.NODE_ENV !== "development") {
  const port = Number(process.env.PORT) || 3333;
  const host = process.env.SERVER_HOST || "http://localhost";
  app.listen(port, () => {
    logger.info(`Server is running at ${host}:${port}/api/v1`);
  });
}
```

**Benefícios de usar só Pino:**
- ✅ Logs estruturados (JSON) - fácil parse
- ✅ Níveis de log configuráveis
- ✅ Melhor performance que console.log
- ✅ Suporta transports (enviar para serviços externos)
- ✅ Timestamp automático
- ✅ Context/metadata consistente

---

## 6. 🔍 Sentry - Como funciona o Monitoring?

### O que é Sentry?

Serviço de **monitoramento de erros** que captura exceções em tempo real e notifica equipe.

### Como Funciona na Prática

**1. Instalação:**
```bash
npm install @sentry/node @sentry/profiling-node
```

**2. Inicialização (src/main/server.ts):**
```typescript
import * as Sentry from "@sentry/node";

// No início do arquivo, antes de tudo
Sentry.init({
  dsn: process.env.SENTRY_DSN, // URL fornecida pelo Sentry
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // 100% das transações
  profilesSampleRate: 1.0, // Performance profiling
});

// Middleware ANTES de outras rotas
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Suas rotas aqui...
app.use(routes);

// Middleware de erro DEPOIS de tudo
app.use(Sentry.Handlers.errorHandler());
```

**3. Captura Automática de Erros:**
```typescript
// Seu código atual
throw new UnauthorizedError("Credenciais inválidas");

// Sentry captura automaticamente e envia para dashboard
```

**4. Enriquecimento com Contexto:**
```typescript
// Em middlewares de autenticação
Sentry.setUser({
  id: user.id,
  role: user.role,
  militaryId: user.militaryId
});

Sentry.setContext("request", {
  ipAddress: req.ip,
  userAgent: req.get("User-Agent"),
});
```

### Dashboard Sentry (o que você vê)

```
🔴 UnauthorizedError: Credenciais inválidas
   📍 src/application/services/auth/login.service.ts:192
   🕐 2025-10-06 14:23:45 UTC
   👤 User: Anônimo
   🌍 IP: 192.168.1.100
   📱 Browser: Chrome 118 / Windows 10
   📊 Stack Trace:
      at LoginService.validateCredentials
      at LoginService.authenticate
      at LoginController.handle

   Ocorrências: 47 vezes (últimas 24h)
   Primeira vez: 2025-10-05 10:30:12
   Última vez: 2025-10-06 14:23:45
```

### Funcionalidades

**1. Alertas:**
- Email/Slack quando erro novo aparece
- Quando mesmo erro ocorre X vezes
- Quando taxa de erro aumenta

**2. Performance Monitoring:**
- Tempo de resposta de endpoints
- Queries lentas (se integrar com DB)
- Gargalos de performance

**3. Release Tracking:**
- Associa erros a versões específicas
- Vê se novo deploy introduziu bugs

**4. Breadcrumbs:**
```typescript
Sentry.addBreadcrumb({
  message: 'User attempted login',
  category: 'auth',
  level: 'info',
  data: { rg: sanitizedCredentials.rg }
});

// Se houver erro, Sentry mostra toda sequência de eventos
```

### Custo

**Plano Free:**
- ✅ 5.000 eventos/mês
- ✅ 1 projeto
- ✅ 30 dias de retenção
- ✅ Alertas por email

**Plano Team ($26/mês):**
- 50.000 eventos/mês
- Projetos ilimitados
- 90 dias de retenção
- Integração Slack/Discord

### Veredito
**VALE MUITO A PENA - Mas implementar em STAGING/PRODUÇÃO**

**Quando implementar:**
1. ✅ Após MVP estar estável
2. ✅ Quando tiver usuários reais
3. ✅ Antes de ir para produção
4. ✅ Quando tiver orçamento (~$26/mês)

**Alternativas Gratuitas:**
- **Bugsnag** (free tier: 7.500 eventos/mês)
- **Rollbar** (free tier: 5.000 eventos/mês)
- **Self-hosted:** Sentry open-source (gratuito mas precisa manter servidor)

---

## 📋 Resumo das Recomendações

| Item | Status Atual | Precisa? | Quando Implementar |
|------|-------------|----------|-------------------|
| Helmet.js | ❌ Não tem | ⛔ **NÃO** | Já tem implementação melhor |
| CSRF Protection | ❌ Não tem | ⛔ **NÃO** | Só se usar cookies httpOnly |
| npm audit | ❌ Não tem | ✅ **SIM** | Adicionar no CI/CD agora |
| Secrets Manager | ❌ Usa .env | ⚠️ **FUTURO** | Ao fazer deploy em produção |
| Migrar console→Pino | ⚠️ Parcial | ✅ **SIM** | Implementar agora |
| Sentry Monitoring | ❌ Não tem | ✅ **SIM** | Após MVP, antes de produção |

---

## 🎯 Ações Prioritárias

### Fazer Agora:
1. ✅ Adicionar npm audit no CI/CD
2. ✅ Migrar console.log para Pino

### Fazer Depois (Produção):
3. ⏳ Secrets Manager (ao fazer deploy)
4. ⏳ Sentry (quando tiver usuários)

### Não Fazer:
- ⛔ Helmet.js (redundante)
- ⛔ CSRF protection (arquitetura não requer)
