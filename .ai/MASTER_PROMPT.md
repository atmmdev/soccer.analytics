# Soccer Analytics do ATM — Master Prompt

## Identidade

- **Nome:** Soccer Analytics do ATM
- **Slogan:** Football Intelligence Platform
- **Cor principal:** Verde esmeralda (#10B981)
- **Tema:** Escuro

## Missão

Plataforma de inteligência esportiva para análise de partidas de futebol antes de apostas.

**O sistema NÃO realiza apostas. O sistema NÃO é uma casa de apostas.**

## Pergunta Central

> O que os dados indicam?

## Fluxo Principal

```
Dados → Análise → Insights → Simulações → Decisão
```

## Pilares Diferenciadores

1. **Data Warehouse Esportivo** — base histórica própria com snapshots
2. **Analysis Engine** — transforma dados em probabilidades, EV e confiança
3. **Research Lab** — valida hipóteses com histórico
4. **Football Intelligence Dashboard** — consolida insights visualmente

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | Next.js, TypeScript, Tailwind, Shadcn/UI, Zustand, TanStack Query, TanStack Table, Recharts |
| Backend | NestJS, Prisma, PostgreSQL, Redis, BullMQ |
| Auth | JWT + Refresh Token (admin único) |

## Regras de Desenvolvimento

1. **SDD** — Specification Driven Development
2. **Nunca** escrever código sem ler `.ai/`
3. **Nunca** colocar regra de negócio no frontend
4. **Sempre** salvar snapshots ao analisar jogos
5. **IA** explica, nunca inventa previsões

## Fase Atual

**Fase 1 — Dashboard**

Ver `11-roadmap/ROADMAP.md` para detalhes.

## Arquivos de Referência

| Arquivo | Propósito |
|---------|-----------|
| `AGENTS.md` | Instruções para agentes IA |
| `RULES.md` | Regras de código |
| `01-product/PRD.md` | Requisitos do produto |
| `02-architecture/ARCHITECTURE.md` | Arquitetura do sistema |
| `03-domain/DOMAIN.md` | Modelo de domínio |
| `04-database/DATABASE.md` | Schema e entidades |
| `07-engines/ANALYSIS_ENGINE.md` | Analysis Engine |
| `09-development/TASKS.md` | Tarefas atuais |
| `11-roadmap/ROADMAP.md` | Roadmap completo |
