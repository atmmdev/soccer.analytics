# Analysis — Playbooks de análise

Playbooks de **decisão** (BET / WATCH / SKIP) por mercado.

## Fundação

| Arquivo | Papel |
|---------|--------|
| [_pipeline.md](./_pipeline.md) | Dados universais + ordem de análise |
| [_template.md](./_template.md) | Template obrigatório para novos playbooks |

## Playbooks

| Arquivo | Mercado |
|---------|---------|
| [match-result-1x2.md](./match-result-1x2.md) | Resultado Final (1X2) |
| [over-under-goals.md](./over-under-goals.md) | Over/Under gols |
| [btts.md](./btts.md) | Ambas marcam |
| [total-corners.md](./total-corners.md) | Total escanteios |
| [total-cards.md](./total-cards.md) | Total cartões |
| [shots-on-target.md](./shots-on-target.md) | Chutes no gol (SOT) |
| [goalkeeper-saves.md](./goalkeeper-saves.md) | Defesas do goleiro |
| [anytime-scorer.md](./anytime-scorer.md) | Anytime marcador |
| [asian-handicap-goals.md](./asian-handicap-goals.md) | Handicap asiático gols |

**Regras:**

- Liquidação (Green/Red/Void) vive só em [`../markets/`](../markets/).
- Não adicione conteúdo ao antigo `analise.md` — use este diretório.
- Plano: [PLAN-kb-betting-clean-architecture.md](../../../.ai/09-development/PLAN-kb-betting-clean-architecture.md)
