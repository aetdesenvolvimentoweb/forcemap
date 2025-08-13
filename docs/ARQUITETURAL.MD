# Decisões Arquiteturais

Este documento registra as principais decisões arquiteturais tomadas durante o desenvolvimento do sistema, seguindo o formato ADR (Architecture Decision Record).

## Contexto

Precisamos de uma arquitetura que permita:

- Testabilidade completa
- Independência de frameworks
- Facilidade de manutenção
- Separação clara de responsabilidades

## Decisão

Adotamos Clean Architecture com as seguintes camadas:

- **Domain**: Entidades e regras de negócio puras
- **Application**: Casos de uso e lógica de aplicação
- **Infra**: Implementações concretas (BD, APIs externas)
- **Presentation**: Interface com o usuário (HTTP, CLI)

### Separação entre Sanitização e Validação

Dados de entrada precisam ser normalizados e validados, mas misturar essas responsabilidades viola o SRP (Single Responsibility Principle).

### Erros customizados específicos:

- `MissingParamError`: Campo obrigatório ausente (400)
- `InvalidParamError`: Valor inválido (422)
- `DuplicatedKeyError`: Violação de unicidade (409)

### Command-Query Separation (CQS)

- Commands (CREATE, UPDATE, DELETE) retornam `void`
- Queries (READ) retornam dados mas não alteram estado

### DTOs e Mappers

- DTOs para entrada (Request) e saída (Response)
- Mappers para conversão entre camadas

### Testes como Documentação Viva

- Nomes de testes descritivos
- Cenários completos nos testes
- Testes de integração como exemplos de uso

## Injeção de Dependências Manual

Pensar a injeção manual num primeiro momento para preservar a inversão de dependências, mas já pensando em um container na fase de utilização de libs externas.

### Princípios Guia

1. **SOLID** em todas as decisões
2. **KISS** - Simplicidade onde possível
3. **YAGNI** - Não adicionar complexidade desnecessária
4. **DRY** - Mas não ao custo de acoplamento

### Revisão

Estas decisões devem ser revisadas periodicamente e atualizadas conforme o projeto evolui.

#### Aplicação

Trata-se de uma API REST onde basicamente existirá um CRUD de postos/graduações militares (military ranks).

##### Desenvolvimento

Num primeiro momento, desenvolveremos sem utilização de libs externas, com a utilização de interfaces para correto isolamento de camadas e dependências.
No passo seguinte, após tudo desenvolvido e testado, implementaremos de forma concreta utilizando o express como framework.
