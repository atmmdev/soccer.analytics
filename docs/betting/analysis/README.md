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
| [double-chance.md](./double-chance.md) | Chance dupla |
| [ht-ft.md](./ht-ft.md) | Intervalo/Final |
| [over-under-goals.md](./over-under-goals.md) | Over/Under gols |
| [btts.md](./btts.md) | Ambas marcam |
| [ht-result.md](./ht-result.md) | Resultado 1º tempo |
| [ht-over-under-goals.md](./ht-over-under-goals.md) | Gols 1º tempo O/U |
| [total-corners.md](./total-corners.md) | Total escanteios |
| [total-cards.md](./total-cards.md) | Total cartões |
| [shots-on-target.md](./shots-on-target.md) | Chutes no gol (SOT) |
| [goalkeeper-saves.md](./goalkeeper-saves.md) | Defesas do goleiro |
| [player-shots.md](./player-shots.md) | Chutes do jogador |
| [anytime-scorer.md](./anytime-scorer.md) | Anytime marcador |
| [first-scorer.md](./first-scorer.md) | Primeiro marcador |
| [asian-handicap-goals.md](./asian-handicap-goals.md) | Handicap asiático gols |

**Regras:**

- Liquidação (Green/Red/Void) vive só em [`../markets/`](../markets/).
- Não adicione conteúdo ao antigo `analise.md` — use este diretório.
- Plano: [PLAN-kb-betting-clean-architecture.md](../../../.ai/09-development/PLAN-kb-betting-clean-architecture.md)
