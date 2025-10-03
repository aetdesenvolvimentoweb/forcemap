# Configuração CORS

Este documento descreve como configurar o CORS (Cross-Origin Resource Sharing) da aplicação usando variáveis de ambiente.

## 📋 Variáveis de Ambiente

### Desenvolvimento

| Variável                     | Tipo    | Padrão                                                                                    | Descrição                                                      |
| ---------------------------- | ------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `CORS_ALLOWED_ORIGINS_DEV`   | string  | `http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://localhost:8080` | Domínios permitidos em desenvolvimento (separados por vírgula) |
| `CORS_ALLOW_CREDENTIALS_DEV` | boolean | `true`                                                                                    | Permite envio de cookies/credenciais                           |
| `CORS_MAX_AGE_DEV`           | number  | `86400`                                                                                   | Tempo de cache para preflight (segundos)                       |

### Produção

| Variável                      | Tipo    | Padrão                                               | Descrição                                         |
| ----------------------------- | ------- | ---------------------------------------------------- | ------------------------------------------------- |
| `CORS_ALLOWED_ORIGINS_PROD`   | string  | `[]`                                                 | **OBRIGATÓRIO** - Domínios permitidos em produção |
| `CORS_ALLOW_NO_ORIGIN_PROD`   | boolean | `false`                                              | Permite requisições sem origin (mobile apps)      |
| `CORS_ALLOW_CREDENTIALS_PROD` | boolean | `false`                                              | Permite envio de cookies/credenciais              |
| `CORS_ALLOWED_METHODS_PROD`   | string  | `GET,POST,PUT,DELETE,PATCH`                          | Métodos HTTP permitidos                           |
| `CORS_ALLOWED_HEADERS_PROD`   | string  | `Content-Type,Authorization,X-Requested-With,Accept` | Headers permitidos                                |
| `CORS_EXPOSED_HEADERS_PROD`   | string  | `""`                                                 | Headers expostos nas respostas                    |
| `CORS_MAX_AGE_PROD`           | number  | `86400`                                              | Tempo de cache para preflight (segundos)          |

## 🚀 Exemplos de Configuração

### Desenvolvimento Local

```bash
# .env ou .env.local
NODE_ENV=development

# Permite localhost em várias portas para desenvolvimento
CORS_ALLOWED_ORIGINS_DEV=http://localhost:3000,http://localhost:3001,http://localhost:8080

# Permite cookies para testing
CORS_ALLOW_CREDENTIALS_DEV=true
```

### Produção - SPA (Single Page Application)

```bash
# .env.production
NODE_ENV=production

# Seus domínios de produção
CORS_ALLOWED_ORIGINS_PROD=https://meuapp.com,https://www.meuapp.com

# Permite cookies se necessário para autenticação
CORS_ALLOW_CREDENTIALS_PROD=true

# Headers customizados se necessário
CORS_EXPOSED_HEADERS_PROD=X-Total-Count,X-Rate-Limit-Remaining
```

### Produção - API Pública + Mobile

```bash
# .env.production
NODE_ENV=production

# Domínios web permitidos
CORS_ALLOWED_ORIGINS_PROD=https://meuapp.com,https://admin.meuapp.com

# Permite apps mobile/Postman (sem origin header)
CORS_ALLOW_NO_ORIGIN_PROD=true

# Não permite cookies para API pública
CORS_ALLOW_CREDENTIALS_PROD=false
```

### Produção - Microserviços

```bash
# .env.production
NODE_ENV=production

# Múltiplos domínios e subdomínios
CORS_ALLOWED_ORIGINS_PROD=https://app.meuapp.com,https://admin.meuapp.com,https://mobile.meuapp.com,https://partner.meuapp.com

# Headers específicos para comunicação entre serviços
CORS_ALLOWED_HEADERS_PROD=Content-Type,Authorization,X-Service-Token,X-Request-ID

# Métodos específicos
CORS_ALLOWED_METHODS_PROD=GET,POST,PUT,PATCH,DELETE,OPTIONS
```

## 🔒 Configurações de Segurança

### ✅ Recomendações

1. **Desenvolvimento**:
   - Use `localhost` e `127.0.0.1` apenas
   - Permita credentials apenas se necessário
   - Seja permissivo para facilitar desenvolvimento

2. **Produção**:
   - **SEMPRE** configure `CORS_ALLOWED_ORIGINS_PROD` explicitamente
   - Use HTTPS para todos os domínios
   - Seja restritivo com credentials
   - Limite methods e headers ao mínimo necessário

### ⚠️ Problemas Comuns

1. **Erro: "CORS não permitido"**
   - Verifique se o domínio está em `CORS_ALLOWED_ORIGINS_PROD`
   - Confirme o protocolo (http vs https)
   - Verifique subdomínios (www vs sem www)

2. **Cookies não funcionam**
   - Configure `CORS_ALLOW_CREDENTIALS_PROD=true`
   - Certifique-se que o frontend envia `credentials: 'include'`
   - Não use `*` em origins quando credentials=true

3. **Headers customizados bloqueados**
   - Adicione em `CORS_ALLOWED_HEADERS_PROD`
   - Certifique-se de incluir headers padrão necessários

## 🧪 Testando a Configuração

### Comando de teste local:

```bash
# Testa origin permitido
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3333/api/v1/auth/login

# Testa origin não permitido
curl -H "Origin: https://malicious.com" \
     -X OPTIONS \
     http://localhost:3333/api/v1/auth/login
```

### Verifique os headers de resposta:

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`
- `Access-Control-Allow-Credentials`
- `Access-Control-Max-Age`

## 📚 Documentação Técnica

O middleware CORS está implementado em:

- **Arquivo**: `src/infra/adapters/middlewares/express-cors.middleware.ts`
- **Testes**: `__tests__/unit/infra/adapters/middlewares/express-cors.middleware.spec.ts`
- **Integração**: `src/main/server.ts`

### Comportamento por Ambiente:

- **Development**: Usa `getDevelopmentCorsConfig()` com fallbacks padrão
- **Production**: Usa `getProductionCorsConfig()` SEM fallbacks (deve ser configurado)
- **Auto**: Detecta ambiente automaticamente via `NODE_ENV`
