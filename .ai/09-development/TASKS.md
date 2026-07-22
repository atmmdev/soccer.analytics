# TASKS.md — Tarefas de Desenvolvimento

## Fase Atual: Statistics Engine + LLM opcional

### Concluído

- [x] Fase 0 — Foundation
- [x] Fase 1 — Dashboard + Shadcn UI
- [x] Fase 2 — Match Center (listagem, detalhes, seed)
- [x] Fase 3 — Match Analyzer (Casa/Fora/H2H, períodos, gráficos)
- [x] Fase 4 — Analysis Engine (Poisson, EV, confidence, snapshots)
- [x] Fase 5 (parcial) — Mercados EV+ na UI
- [x] Fase 6 — Ticket Builder (montagem, correlação, salvar)
- [x] Fase 7 — Bankroll (ROI, yield, drawdown, apostar/liquidar)
- [x] Fase 8 — Research Lab (hipóteses e simulações)
- [x] Fase 9 — AI Engine (explicações baseadas em dados)
- [x] Script `pnpm start`

### Próximo

- [x] Dashboard e Scanner EV+ com dados reais da API
- [x] Data Engine — adapter API-Football + importação jogos/odds
- [x] Statistics Engine — stats reais de jogos finalizados (gols, forma, H2H, xG estimado)
- [x] Analysis + Analyzer conectados ao Statistics Engine
- [x] Importação de estatísticas de partida (xG, chutes, escanteios) via API-Football
- [x] Alertas EV+ (hoje/amanhã) + badge dinâmico no header
- [x] Widget Match Analysis — botão Analisar Jogo + snapshot Poisson no dashboard
- [x] Página Relatórios — performance banca, bilhetes, precisão análises + export JSON
- [x] Sincronização automática diária (jogos, odds, stats, análises Poisson)
- [x] Remoção de seed demo e mocks do dashboard
- [x] Busca global no header (jogos, times, mercados EV+)
- [x] LLM opcional no AI Engine (OpenAI — fallback template)
- [x] Research Lab com histórico real de jogos finalizados
- [x] Filtro de campeonato na página Jogos (busca + lista)
- [x] Mercados avançados no Analysis Engine (escanteios, cartões via Poisson)
- [x] Handicap asiático no Analysis Engine + importação de odds
- [x] Mercados de jogador (importação + listagem; EV via prob. implícita, SKIP)
- [x] Paginação "Carregar mais" na página Jogos (useInfiniteQuery)
- [x] Histórico de Análises — `GET /analysis/history` + página `/history`
- [x] Player Engine — importação de stats via API-Football + modelo Poisson anytime scorer

### Próximo (pós-roadmap core)

- [ ] Export PDF nos Relatórios
- [ ] Notificações push / e-mail para alertas EV+

### Plano ativo — KB Betting + Clean Architecture

Ver [PLAN-kb-betting-clean-architecture.md](./PLAN-kb-betting-clean-architecture.md):

- [x] Fase 0–1 + playbooks core + HT/2T lote + props (shots, first, double chance, HT/FT)
- [x] E1 sidebar · dedupe `bet365Ref` · engines doc
- [x] E2: `modelSupported` + Score IA `W_*` no Analysis Engine (`scoreIa`)
- [x] Research: sintético **off** por default (`allowSynthetic`)
- [x] Fase 3 leve: prompt analyzer no AI Engine
- [ ] Playbooks restantes (2T, props avançadas, especiais)
- [ ] Limiar BET por playbook (ex. 87 cartões) no engine
- [ ] Ticket Builder consumir `docs/prompts/ticket-builder.md`

```bash
pnpm start
```
