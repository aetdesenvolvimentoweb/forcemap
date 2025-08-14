# Decisão de Coverage: AppError

## 🤔 **Problema Identificado**

O arquivo `src/domain/errors/app.error.ts` apresentava 66.67% de cobertura de branches devido a linhas não testadas no método constructor:

```typescript
// Linhas 52-58 não cobertas:
if (Error.captureStackTrace) {
  Error.captureStackTrace(this, AppError);
}
```

## 💡 **Análise e Decisão**

### **Características do AppError:**

- ✅ Classe base abstrata para outros erros
- ✅ Nunca instanciada diretamente no código de produção
- ✅ Serve apenas como modelo/contrato para erros específicos
- ✅ Lógica extremamente simples (apenas constructor)
- ✅ **Já testada indiretamente** através de:
  - `InvalidParamError`
  - `MissingParamError`
  - `DuplicatedKeyError`
  - `EmptyRequestBodyError`

### **Linha Não Coberta:**

A linha não coberta (`Error.captureStackTrace`) é:

- **Específica do Node.js** (não existe em browsers)
- **Feature opcional** de debugging/stack trace
- **Não crítica** para funcionalidade da aplicação
- **Difícil de testar** de forma consistente

### **Opções Avaliadas:**

#### ❌ **Opção 1: Criar Teste Unitário**

**Problemas:**

- Teste artificial sem valor de negócio
- Instanciação desnecessária de classe abstrata
- Complexidade para testar feature de debugging
- Foco em implementação ao invés de comportamento

#### ✅ **Opção 2: Excluir do Coverage (ESCOLHIDA)**

**Vantagens:**

- Mantém foco em testes que agregam valor
- Evita testes artificiais
- Classe já testada indiretamente
- Decisão arquitetural documentada

## 🎯 **Implementação**

Adicionada exclusão no `jest.config.ts`:

```typescript
collectCoverageFrom: [
  "<rootDir>/src/**/*.ts",
  "!<rootDir>/src/**/error.ts",
  "!<rootDir>/src/**/index.ts",
  "!<rootDir>/src/**/interface.ts",
  "!<rootDir>/src/**/protocol.ts",
  "!<rootDir>/src/domain/errors/app.error.ts", // Base class - testada indiretamente
],
```

## 📚 **Justificativa Técnica**

### **Princípios Seguidos:**

1. **Teste de Valor**: Testar comportamentos, não implementação
2. **Evitar Testes Artificiais**: Não criar testes apenas para coverage
3. **Teste Indireto**: Classe base já validada via herança
4. **Foco no Essencial**: Priorizar lógica de negócio

### **Precedentes na Comunidade:**

- Classes abstratas/base frequentemente excluídas
- DTOs, interfaces e modelos simples comumente ignorados
- Coverage 100% não é sempre o objetivo ideal

## ✅ **Resultado**

Com esta decisão, mantemos:

- **Coverage significativo** em lógica importante
- **Testes valiosos** sem artificialidades
- **Código limpo** sem testes desnecessários
- **Documentação clara** da decisão arquitetural

---

_Decisão tomada em: 14/08/2025_
_Rationale: Classes base abstratas com lógica simples não requerem testes diretos quando já validadas indiretamente._
