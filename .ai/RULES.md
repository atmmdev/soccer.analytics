# RULES.md — Regras de Código

## Geral

1. TypeScript strict em todo o projeto
2. Nomes em inglês no código, documentação pode ser PT-BR
3. Commits apenas quando solicitado
4. Não adicionar dependências desnecessárias

## Backend (NestJS)

### Estrutura de Módulo

```typescript
module/
├── module.module.ts
├── module.controller.ts
├── module.service.ts
├── dto/
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
└── __tests__/
    └── module.service.spec.ts
```

### Convenções

- Use `@Injectable()` para services
- DTOs com `class-validator` decorators
- Guards para autenticação
- Interceptors para transformação de resposta
- Exceptions do NestJS (`NotFoundException`, etc.)

### Engines

- Cada engine é auto-contido
- Engines comunicam via services, não imports diretos entre engines
- Analysis Engine orquestra outros engines
- Snapshots são salvos após cada análise

### Database

- Prisma como ORM
- Migrations versionadas
- Seeds apenas para desenvolvimento
- Índices em campos de busca frequente

## Frontend (Next.js)

### Estrutura

- App Router (não Pages Router)
- Server Components por padrão
- Client Components apenas quando necessário (`'use client'`)
- API calls via TanStack Query

### Convenções

- Componentes em PascalCase
- Hooks em camelCase com prefixo `use`
- Stores Zustand em `stores/`
- Tipos compartilhados de `@soccer-analytics/shared`

### UI

- Shadcn/UI como base
- Tailwind para estilos
- Tema escuro por padrão
- Verde esmeralda (#10B981) como cor primária
- Responsivo mobile-first

## Testes

- Jest para backend
- Vitest para frontend (quando aplicável)
- Testes de engines são prioritários
- Coverage mínimo de 70% para engines

## Segurança

- JWT com expiração curta (15min)
- Refresh token com rotação
- Rate limiting em endpoints públicos
- Validação de input em todos os endpoints
- CORS configurado para domínio específico

## Performance

- Redis para cache de queries frequentes
- BullMQ para jobs assíncronos (importação de dados)
- Paginação em listagens
- Lazy loading de componentes pesados
