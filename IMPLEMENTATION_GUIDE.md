# Guia de Implementação - Melhorias de Segurança

## 📍 Locais que Usam console.log (e devem migrar para Pino)

### Encontrados:
1. `src/main/server.ts:37` - Log de inicialização
2. `src/main/seed/database.seed.ts:69` - Log de seed concluído
3. `src/dev.ts:6,12,15` - Logs de desenvolvimento
4. `src/infra/adapters/express.route.adapter.ts:24` - Log de erro
5. `src/infra/adapters/middlewares/express-cors.middleware.ts:210` - Bloqueio CORS
6. `src/infra/adapters/middlewares/express-security-logger.middleware.ts:189-196` - Logs de segurança
7. `src/infra/adapters/middlewares/express-seed.middleware.ts:25` - Erro de seed
8. `src/main/seed/seed.manager.ts:23,35,37` - Logs de seed

---

## 🎯 Prioridade 1: Adicionar npm audit no CI/CD

### Opção A: GitHub Actions

Criar arquivo `.github/workflows/security-audit.yml`:

```yaml
name: Security Audit

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Roda diariamente às 9h UTC para detectar novas vulnerabilidades
    - cron: '0 9 * * *'

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: npm audit --audit-level=moderate
        continue-on-error: false

      - name: Check for outdated dependencies
        run: npm outdated || true
```

### Opção B: GitLab CI

Adicionar no `.gitlab-ci.yml`:

```yaml
security-audit:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm audit --audit-level=moderate
  only:
    - main
    - merge_requests
  allow_failure: false
```

### Opção C: Husky (Pre-push, não pre-commit)

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running security audit..."
npm audit --audit-level=high

if [ $? -ne 0 ]; then
  echo "❌ Security vulnerabilities found! Fix them before pushing."
  exit 1
fi

echo "✅ No high/critical vulnerabilities found"
```

**Recomendação:** GitHub Actions (Opção A) - não atrapalha desenvolvimento.

---

## 🎯 Prioridade 2: Migrar console.log para Pino

### Etapa 1: Criar Logger Global

**Arquivo: `src/infra/adapters/global.logger.ts`**

```typescript
import { PinoLoggerAdapter } from "./pino.logger.adapter";

/**
 * Logger global da aplicação.
 * Usar em locais onde injeção de dependência não é prática
 * (inicialização, middlewares de erro, etc.)
 */
export const globalLogger = new PinoLoggerAdapter({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
```

### Etapa 2: Atualizar Arquivos

#### 2.1 `src/main/server.ts`

**Antes:**
```typescript
console.log(`✅ Server is running at ${host}:${port}/api/v1`);
```

**Depois:**
```typescript
import { globalLogger } from "../infra/adapters/global.logger";

if (process.env.NODE_ENV !== "development") {
  const port = Number(process.env.PORT) || 3333;
  const host = process.env.SERVER_HOST || "http://localhost";
  app.listen(port, () => {
    globalLogger.info(`Server is running at ${host}:${port}/api/v1`, {
      port,
      host,
      environment: process.env.NODE_ENV,
    });
  });
}
```

#### 2.2 `src/main/seed/seed.manager.ts`

**Antes:**
```typescript
console.log("🌱 Starting database seed...");
console.log("🌱 Database seed completed successfully");
console.error("❌ Database seed failed:", error);
```

**Depois:**
```typescript
import { globalLogger } from "../../infra/adapters/global.logger";

export class SeedManager {
  public static async runSeed(): Promise<void> {
    if (this.isSeeded) return;

    try {
      globalLogger.info("Starting database seed");

      await DatabaseSeed.seed();

      this.isSeeded = true;
      globalLogger.info("Database seed completed successfully");
    } catch (error) {
      globalLogger.error("Database seed failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
```

#### 2.3 `src/infra/adapters/middlewares/express-security-logger.middleware.ts`

**Antes:**
```typescript
class ConsoleSecurityLogger implements SecurityLogger {
  private getLogMethod(severity: SecurityEventSeverity) {
    switch (severity) {
      case SecurityEventSeverity.LOW: return console.info;
      case SecurityEventSeverity.MEDIUM: return console.warn;
      case SecurityEventSeverity.HIGH:
      case SecurityEventSeverity.CRITICAL: return console.error;
      default: return console.log;
    }
  }

  logSecurityEvent(event: SecurityEvent): void {
    const logMethod = this.getLogMethod(event.severity);
    logMethod(`🔒 [SECURITY] ${this.formatSecurityLog(event)}`);
  }
}
```

**Depois:**
```typescript
import { globalLogger } from "../global.logger";

class PinoSecurityLogger implements SecurityLogger {
  private getLogLevel(severity: SecurityEventSeverity): 'info' | 'warn' | 'error' {
    switch (severity) {
      case SecurityEventSeverity.LOW: return 'info';
      case SecurityEventSeverity.MEDIUM: return 'warn';
      case SecurityEventSeverity.HIGH:
      case SecurityEventSeverity.CRITICAL: return 'error';
      default: return 'info';
    }
  }

  logSecurityEvent(event: SecurityEvent): void {
    const level = this.getLogLevel(event.severity);
    globalLogger[level](`[SECURITY] ${event.message}`, {
      type: "SECURITY_EVENT",
      ...event,
    });
  }

  // ... restante dos métodos
}

// Exportar instância
export const securityLogger: SecurityLogger = new PinoSecurityLogger();
```

#### 2.4 `src/infra/adapters/middlewares/express-cors.middleware.ts`

**Antes:**
```typescript
console.warn(
  `🚫 CORS: Origem bloqueada - ${origin || "undefined"} tentou acessar ${req.path}`,
);
```

**Depois:**
```typescript
import { globalLogger } from "../global.logger";

// ... dentro do middleware
globalLogger.warn("CORS: Origem bloqueada", {
  origin: origin || "undefined",
  path: req.path,
  method: req.method,
  ip: req.ip,
});
```

#### 2.5 `src/infra/adapters/express.route.adapter.ts`

**Antes:**
```typescript
console.error("Express route adapter error:", error);
```

**Depois:**
```typescript
import { globalLogger } from "./global.logger";

// ... no catch
globalLogger.error("Express route adapter error", {
  error: error instanceof Error ? error.message : "Unknown error",
  stack: error instanceof Error ? error.stack : undefined,
  path: request?.url,
});
```

### Etapa 3: Atualizar .env.example

```bash
# ==========================================
# Logging Configuration
# ==========================================

# Nível de log (error, warn, info, debug, trace)
LOG_LEVEL=info

# Pretty print em desenvolvimento (true/false)
LOG_PRETTY=true
```

### Etapa 4: Instalar pino-pretty (opcional, para logs bonitos em dev)

```bash
npm install --save-dev pino-pretty
```

**Atualizar `src/infra/adapters/global.logger.ts`:**
```typescript
export const globalLogger = new PinoLoggerAdapter({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" && process.env.LOG_PRETTY === "true"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
```

### Benefícios da Migração

**Antes (console.log):**
```
✅ Server is running at http://localhost:3333/api/v1
```

**Depois (Pino):**
```json
{
  "level": 30,
  "time": "2025-10-06T14:30:45.123Z",
  "msg": "Server is running at http://localhost:3333/api/v1",
  "port": 3333,
  "host": "http://localhost",
  "environment": "production"
}
```

**Com pino-pretty em desenvolvimento:**
```
[14:30:45.123] INFO: Server is running at http://localhost:3333/api/v1
    port: 3333
    host: "http://localhost"
    environment: "production"
```

---

## 📊 Checklist de Implementação

### npm audit no CI/CD
- [ ] Criar `.github/workflows/security-audit.yml` (ou GitLab CI)
- [ ] Testar workflow fazendo push
- [ ] Configurar notificações (email/Slack) para falhas
- [ ] Adicionar badge no README.md

### Migração para Pino
- [ ] Criar `src/infra/adapters/global.logger.ts`
- [ ] Atualizar `express-security-logger.middleware.ts`
- [ ] Atualizar `express-cors.middleware.ts`
- [ ] Atualizar `express.route.adapter.ts`
- [ ] Atualizar `server.ts`
- [ ] Atualizar `seed.manager.ts`
- [ ] Atualizar `database.seed.ts`
- [ ] Atualizar `express-seed.middleware.ts`
- [ ] (Opcional) Atualizar `dev.ts`
- [ ] Instalar `pino-pretty` (dev dependency)
- [ ] Atualizar `.env.example` com `LOG_LEVEL` e `LOG_PRETTY`
- [ ] Rodar testes: `npm run test:unit`
- [ ] Testar em desenvolvimento: `npm run dev`

---

## 🧪 Como Testar

### Testar npm audit

```bash
# Localmente
npm audit --audit-level=moderate

# Simular vulnerabilidade (instalar pacote vulnerável)
npm install express@4.17.0  # versão antiga
npm audit  # Deve mostrar vulnerabilidades

# Voltar
npm install express@latest
```

### Testar Logs com Pino

```bash
# Desenvolvimento (logs bonitos)
LOG_LEVEL=debug LOG_PRETTY=true npm run dev

# Produção (logs JSON)
NODE_ENV=production npm start

# Testar diferentes níveis
LOG_LEVEL=error npm run dev  # Só erros
LOG_LEVEL=debug npm run dev  # Tudo
```

---

## 🚀 Ordem de Implementação Recomendada

1. **Primeiro:** npm audit no CI/CD (5 minutos)
   - Não afeta código existente
   - Benefício imediato

2. **Segundo:** Migração para Pino (1-2 horas)
   - Fazer em branch separada
   - Testar localmente
   - Rodar todos os testes
   - Fazer PR

3. **Depois (futuro):** Sentry/Monitoring
   - Quando tiver orçamento
   - Quando tiver usuários reais

4. **Produção:** Secrets Manager
   - Quando fazer deploy real
   - Configurar junto com CI/CD de deploy
