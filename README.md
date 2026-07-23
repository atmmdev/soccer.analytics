# Soccer Analytics do ATM

**Football Intelligence Platform**

Plataforma de inteligência esportiva para análise de partidas de futebol. Não é uma casa de apostas — é uma ferramenta de Business Intelligence aplicada ao futebol.

> O que os dados indicam?

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind, Shadcn/UI, Zustand, TanStack Query |
| Backend | NestJS, Prisma, PostgreSQL, Redis |
| Infra | Docker Compose, pnpm workspaces |

## Pré-requisitos

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

## Início rápido

Na **raiz do projeto**:

```bash
pnpm install   # só na primeira vez
pnpm start
```

O `pnpm start` faz tudo automaticamente: `.env`, Docker, banco, seed, API e frontend.

Sem Docker (só login/UI): `pnpm start:lite`

## Setup manual

```bash
# 1. Clonar e instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local

# 3. Subir banco de dados
pnpm docker:up

# 4. Gerar Prisma client e rodar migrations
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Iniciar desenvolvimento
pnpm dev
```

## URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |
| Prisma Studio | `pnpm db:studio` |

## Login

Credenciais do admin ficam em `apps/api/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
Para referência local, use o arquivo `SENHAS.md` na raiz (não versionado).

## Estrutura

```
soccer.analytics/
├── .ai/                  # Documentação SDD
├── apps/
│   ├── api/              # NestJS backend
│   └── web/              # Next.js frontend
├── docker-compose.yml
└── package.json
```

## Desenvolvimento

Este projeto segue **SDD (Specification Driven Development)**. Antes de implementar qualquer feature:

1. Leia a documentação em `.ai/`
2. Verifique a fase atual em `.ai/11-roadmap/ROADMAP.md`
3. Consulte tarefas em `.ai/09-development/TASKS.md`

## Roadmap

| Fase | Módulo | Status |
|------|--------|--------|
| 0 | Foundation | Em progresso |
| 1 | Dashboard | Pendente |
| 2 | Match Center | Pendente |
| 3 | Match Analyzer | Pendente |
| 4 | Analysis Engine | Pendente |
| 5 | Market Analyzer | Pendente |
| 6 | Ticket Builder | Pendente |
| 7 | Bankroll | Pendente |
| 8 | Research Lab | Pendente |
| 9 | AI Engine | Pendente |

## Scripts

```bash
pnpm start        # Tudo automático (Docker + DB + API + Web)
pnpm start:lite   # Só API + Web (sem Docker/banco)
pnpm dev          # Inicia API + Web
pnpm dev:api      # Apenas API
pnpm dev:web      # Apenas Web
pnpm build        # Build de produção
pnpm db:migrate   # Rodar migrations
pnpm db:seed      # Popular banco
pnpm docker:up    # Subir PostgreSQL + Redis
pnpm docker:down  # Parar containers
```
