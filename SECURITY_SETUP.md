# 🔐 Configuração de Segurança - ForceMap

## Configuração de JWT Secrets (OBRIGATÓRIO)

### 1. Geração de Secrets Seguros

Para gerar secrets criptograficamente seguros, execute:

```bash
# Gerar JWT_ACCESS_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Gerar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Configuração em Desenvolvimento

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Gere e adicione os secrets ao arquivo `.env`:

```bash
JWT_ACCESS_SECRET=<cole aqui o secret gerado para access token>
JWT_REFRESH_SECRET=<cole aqui o secret gerado para refresh token>
```

### 3. Configuração em Produção

⚠️ **IMPORTANTE**: Em produção, os secrets devem:

- Ser configurados via variáveis de ambiente (não em arquivos)
- Ter **no mínimo 32 caracteres** (recomendado 64+)
- Ser únicos e gerados aleatoriamente
- **NUNCA** serem commitados no Git

#### Exemplo de configuração em servidor:

```bash
export JWT_ACCESS_SECRET="<secret-gerado-64-chars>"
export JWT_REFRESH_SECRET="<secret-gerado-64-chars>"
export NODE_ENV="production"
```

#### Validações Implementadas

O sistema validará automaticamente:

- ✅ Presença obrigatória de `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET`
- ✅ Tamanho mínimo de 32 caracteres em `NODE_ENV=production`
- ✅ Lançará `ConfigurationError` se validação falhar

## Outras Configurações de Segurança

### Rate Limiting

```bash
RATE_LIMIT_LOGIN_IP_MAX_ATTEMPTS=10      # Tentativas por IP
RATE_LIMIT_LOGIN_USER_MAX_ATTEMPTS=5     # Tentativas por usuário
RATE_LIMIT_LOGIN_WINDOW_MINUTES=15       # Janela de tempo
```

### CORS em Produção

```bash
CORS_ALLOWED_ORIGINS_PROD=https://seudominio.com,https://app.seudominio.com
CORS_ALLOW_CREDENTIALS_PROD=true
```

## Checklist de Segurança

Antes de colocar em produção:

- [ ] Secrets JWT gerados aleatoriamente com 64+ caracteres
- [ ] `NODE_ENV=production` configurado
- [ ] Secrets configurados via variáveis de ambiente do servidor
- [ ] CORS configurado com domínios específicos
- [ ] Rate limiting ajustado conforme necessidade
- [ ] Logs de segurança monitorados
- [ ] HTTPS habilitado (TLS/SSL)
- [ ] Headers de segurança validados

## Troubleshooting

### Erro: "JWT_ACCESS_SECRET e JWT_REFRESH_SECRET devem ser configurados"

**Solução**: Configure as variáveis de ambiente conforme seção 2 ou 3 acima.

### Erro: "JWT_ACCESS_SECRET deve ter no mínimo 32 caracteres em produção"

**Solução**: Gere um novo secret usando o comando da seção 1 e reconfigure.

## Contato de Segurança

Para reportar vulnerabilidades de segurança, entre em contato com a equipe de desenvolvimento.
