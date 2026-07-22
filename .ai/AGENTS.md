# AGENTS.md — Instruções para Agentes IA

## Antes de Qualquer Código

1. Ler `MASTER_PROMPT.md`
2. Verificar fase atual em `11-roadmap/ROADMAP.md`
3. Consultar tarefas em `09-development/TASKS.md`
4. Seguir regras em `RULES.md`

## Estrutura do Repositório

```
soccer.analytics/
├── .ai/                    # Documentação SDD
├── apps/
│   ├── api/                # NestJS backend
│   └── web/                # Next.js frontend
├── packages/
│   └── shared/             # Tipos e utilitários compartilhados
├── docker-compose.yml
└── package.json
```

## Backend (apps/api)

### Módulos Principais

- `auth` — JWT + Refresh Token
- `prisma` — Database access
- `engines/` — Todos os engines de negócio

### Engines

Cada engine é um módulo NestJS independente. **Só listar o que existe no código:**

| Engine | Responsabilidade |
|--------|------------------|
| data-engine | Importa dados de APIs externas (API-Football) |
| statistics-engine | Estatísticas de times / forma / H2H |
| analysis-engine | Probabilidade, odd justa, EV, confidence, BET/WATCH/SKIP |
| player-engine | Props / marcadores (quando há modelo) |
| ticket-engine | Monta bilhetes + correlação |
| simulation-engine | Simulações / research |
| ai-engine | Explica recomendações (template + LLM opcional) |

**Não existem** como módulos separados: MatchEngine, TeamEngine, MarketEngine, EvEngine, RecommendationEngine, ResearchEngine — a lógica está nos engines acima + serviços HTTP (`analysis`, `research`, `matches`).

KB de apostas / playbooks: `docs/betting/` · Prompts: `docs/prompts/` · Plano: `09-development/PLAN-kb-betting-clean-architecture.md`.

### Convenções

- Controllers apenas roteiam
- Services contêm lógica
- Engines nunca dependem do frontend
- DTOs com class-validator
- Testes unitários para engines

## Frontend (apps/web)

### Estrutura

```
src/
├── app/                    # App Router
├── components/
│   ├── ui/                 # Shadcn components
│   ├── dashboard/
│   ├── matches/
│   └── ...
├── hooks/
├── lib/
├── stores/                 # Zustand
└── types/
```

### Regras

- **Zero** regra de negócio no frontend
- TanStack Query para data fetching
- Zustand para estado local (UI)
- Componentes Shadcn para UI

## Fluxo de Trabalho

```
Especificação → Planejamento → Implementação → Testes → Documentação → Roadmap
```

## Ao Finalizar uma Tarefa

1. Atualizar `TASKS.md`
2. Atualizar `ROADMAP.md` se necessário
3. Garantir testes passando
4. Não criar commits sem solicitação
