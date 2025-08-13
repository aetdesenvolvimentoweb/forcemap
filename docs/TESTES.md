# Estrutura de Testes

Este projeto utiliza uma separação clara entre testes unitários e de integração através de convenções de nomenclatura de arquivos.

## Convenções de Nomenclatura

### 📋 Testes Unitários (`.spec.ts`)

- **Padrão**: `*.spec.ts`
- **Propósito**: Testar componentes individuais de forma isolada
- **Características**:
  - Mocks de todas as dependências
  - Foco no comportamento de um único componente
  - Execução rápida e determinística
  - Ideal para TDD (Test Driven Development)

**Exemplos**:

- `create.military-rank.sanitizer.spec.ts`
- `create.military-rank.validator.spec.ts`
- `create.military-rank.service.spec.ts`

### 🔗 Testes de Integração (`.test.ts`)

- **Padrão**: `*.test.ts`
- **Propósito**: Testar a interação entre múltiplos componentes
- **Características**:
  - Uso de implementações reais quando possível
  - Mock apenas de dependências externas (BD, APIs)
  - Validação do fluxo completo end-to-end
  - Cenários reais de uso

**Exemplos**:

- `create.military-rank.service.test.ts`

## Scripts Disponíveis

### 🧪 Executar Todos os Testes

```bash
pnpm test
# Executa tanto testes unitários (.spec.ts) quanto de integração (.test.ts)
# NÃO coleta coverage - ideal para verificação rápida
```

### ⚡ Executar Apenas Testes Unitários

```bash
pnpm test:unit
# Executa apenas arquivos *.spec.ts
# NÃO coleta coverage - ideal para desenvolvimento rápido e TDD
```

### 🔄 Executar Apenas Testes de Integração

```bash
pnpm test:integration
# Executa apenas arquivos *.test.ts
# NÃO coleta coverage - ideal para validar fluxos completos
```

### 📊 Executar Todos os Testes com Coverage

```bash
pnpm test:coverage
# Executa todos os testes (.spec.ts + .test.ts) E coleta coverage
# ÚNICO comando que gera relatórios de cobertura
```

### 🔧 Outros Scripts de Teste

```bash
pnpm test:staged       # Apenas testes dos arquivos modificados (sem coverage)
```

## Estrutura de Arquivos

```
__tests__/
├── application/
│   ├── sanitizers/
│   │   └── military-rank/
│   │       └── create.military-rank.sanitizer.spec.ts     # ✅ Unitário
│   ├── validators/
│   │   └── military-rank/
│   │       └── create.military-rank.validator.spec.ts     # ✅ Unitário
│   └── services/
│       └── military-rank/
│           ├── create.military-rank.service.spec.ts       # ✅ Unitário
│           └── create.military-rank.service.test.ts       # 🔗 Integração
├── domain/
├── infra/
└── presentation/
```

## Configurações Jest

### `jest.config.ts` (Padrão)

- Executa todos os testes (`.spec.ts` + `.test.ts`)
- Usado pelo comando `pnpm test`

### `jest.unit.config.ts`

- Executa apenas testes unitários (`.spec.ts`)
- Usado pelo comando `pnpm test:unit`

### `jest.integration.config.ts`

- Executa apenas testes de integração (`.test.ts`)
- Usado pelo comando `pnpm test:integration`

## Boas Práticas

### 🎯 Para Testes Unitários (`.spec.ts`)

1. **Mock todas as dependências** para isolar o SUT
2. **Teste comportamentos**, não implementação
3. **Use factory functions** para setup consistente
4. **Siga o padrão AAA** (Arrange, Act, Assert)
5. **Nomes descritivos** que documentem o comportamento

### 🎯 Para Testes de Integração (`.test.ts`)

1. **Use implementações reais** da camada testada
2. **Mock apenas dependências externas** (BD, APIs, filesystem)
3. **Teste cenários reais** de uso da aplicação
4. **Valide o fluxo completo** entre componentes
5. **Inclua cenários de erro** e edge cases

## Exemplo Prático

### Teste Unitário (`.spec.ts`)

```typescript
// Testa APENAS o service, mockando sanitizer e validator
const sanitizer = jest.mocked<CreateMilitaryRankSanitizerProtocol>({
  sanitize: jest.fn(),
});
const validator = jest.mocked<CreateMilitaryRankValidatorProtocol>({
  validate: jest.fn(),
});
```

### Teste de Integração (`.test.ts`)

```typescript
// Testa service + sanitizer + validator juntos
const sanitizer = new CreateMilitaryRankSanitizer(); // ✅ Real
const validator = new CreateMilitaryRankValidator({
  // ✅ Real
  militaryRankRepository: mockRepository, // ❌ Mock apenas DB
});
```

## Métricas

- **Total de Testes**: 56
- **Testes Unitários**: 43 (`.spec.ts`)
- **Testes de Integração**: 13 (`.test.ts`)
- **Cobertura**: Configurada para 80% mínimo

Essa estrutura garante tanto **velocidade no desenvolvimento** (testes unitários) quanto **confiança na integração** (testes de integração).
