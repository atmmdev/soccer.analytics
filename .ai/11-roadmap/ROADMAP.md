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

## Fase 2 — Match Center ✅

**Objetivo:** Visualização e listagem de jogos

- [x] Listagem de jogos com filtros
- [x] Detalhes da partida
- [x] Status (agendado, ao vivo, finalizado)
- [ ] Integração Data Engine (importação)

---

## Fase 3 — Match Analyzer ⬅ ATUAL

**Objetivo:** Comparação detalhada de equipes

- [x] Comparador Casa vs Fora vs H2H
- [x] Períodos: 5, 10, 15, 20 jogos
- [x] Indicadores: gols, escanteios, cartões, xG, etc.
- [x] Gráficos comparativos (Recharts)

---

## Fase 4 — Analysis Engine

**Objetivo:** Motor de análise funcional

- [x] Pipeline de análise completo
- [x] Cálculo de probabilidades (Poisson)
- [x] Cálculo de EV
- [x] Confidence scoring
- [x] Snapshots automáticos
- [x] Atualização pós-jogo (`POST /analysis/snapshots/:id/resolve`)

---

## Fase 5 — Market Analyzer

**Objetivo:** Análise por mercado

- [x] Mercados 1X2, Over/Under, BTTS
- [x] Probabilidade + Odd Justa + EV por mercado
- [x] Confidence Score por mercado
- [x] Recomendações BET/SKIP/WATCH
- [ ] Escanteios, cartões, handicap, jogador

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
