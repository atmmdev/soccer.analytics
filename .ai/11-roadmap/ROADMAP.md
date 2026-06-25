# ROADMAP.md

## Fase 0 — Foundation ✅

**Objetivo:** Infraestrutura base funcional

- [x] Documentação SDD (`.ai/`)
- [x] Monorepo (pnpm workspaces)
- [x] Docker Compose (PostgreSQL + Redis)
- [x] NestJS API com estrutura de engines
- [x] Prisma schema com todas entidades
- [x] Auth (JWT + Refresh Token, admin único)
- [x] Next.js com Tailwind + Shadcn/UI
- [x] Tema escuro + verde esmeralda
- [x] Login funcional
- [x] Layout base protegido

**Critério de conclusão:** Login funciona, API responde, banco conectado.

---

## Fase 1 — Dashboard ✅

**Objetivo:** Painel principal com widgets

- [x] Layout dashboard (sidebar + header)
- [x] Widget: Banca (saldo, ROI, yield)
- [x] Widget: Jogos do dia
- [x] Widget: Mercados sugeridos
- [x] Widget: EV+ highlights
- [x] Widget: Bilhete recomendado
- [x] Barra de pesquisa rápida

**Critério de conclusão:** Dashboard carrega com dados mock/reais.

---

## Fase 2 — Match Center ⬅ ATUAL

**Objetivo:** Visualização e listagem de jogos

- [x] Listagem de jogos com filtros
- [x] Detalhes da partida
- [x] Status (agendado, ao vivo, finalizado)
- [ ] Integração Data Engine (importação)

---

## Fase 3 — Match Analyzer

**Objetivo:** Comparação detalhada de equipes

- [ ] Comparador Casa vs Fora vs H2H
- [ ] Períodos: 5, 10, 15, 20 jogos
- [ ] Indicadores: gols, escanteios, cartões, xG, etc.
- [ ] Gráficos comparativos (Recharts)

---

## Fase 4 — Analysis Engine

**Objetivo:** Motor de análise funcional

- [ ] Pipeline de análise completo
- [ ] Cálculo de probabilidades
- [ ] Cálculo de EV
- [ ] Confidence scoring
- [ ] Snapshots automáticos
- [ ] Atualização pós-jogo

---

## Fase 5 — Market Analyzer

**Objetivo:** Análise por mercado

- [ ] Todos os tipos de mercado
- [ ] Probabilidade + Odd Justa + EV por mercado
- [ ] Confidence Score por mercado
- [ ] Recomendações BET/SKIP/WATCH

---

## Fase 6 — Ticket Builder

**Objetivo:** Montagem de bilhetes

- [ ] Seleção de mercados
- [ ] Cálculo de odd combinada
- [ ] Validação de correlação
- [ ] Cálculo de stake e retorno
- [ ] Salvar bilhete

---

## Fase 7 — Bankroll

**Objetivo:** Controle financeiro

- [ ] Tracking de ROI/Yield
- [ ] Drawdown
- [ ] Histórico de bilhetes
- [ ] Gráficos de performance

---

## Fase 8 — Research Lab

**Objetivo:** Laboratório de hipóteses

- [ ] Criar estratégias de pesquisa
- [ ] Executar simulações com histórico
- [ ] Resultados: ROI, Yield, Win Rate, Drawdown
- [ ] Comparar estratégias

---

## Fase 9 — AI Engine

**Objetivo:** Explicações inteligentes

- [ ] Integração com LLM
- [ ] Explicação de recomendações baseada em dados
- [ ] Nunca inventar previsões
- [ ] Justificativas com referência a estatísticas

---

## Visão de Longo Prazo

- Integração com múltiplas APIs de dados
- Importação automática de odds
- Notificações de jogos com EV+
- Exportação de relatórios
- Potencial SaaS
