# Template — Playbook de análise por mercado

> Copie este arquivo para `analysis/<slug>.md`.  
> **Não** copie tabelas Green/Red de `markets/` — apenas linke.  
> Pipeline universal: [_pipeline.md](./_pipeline.md)

---

```markdown
# Análise — <Nome do mercado>

> **Liquidação (SSOT):** [markets/…](../markets/…)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [ai/score.md](../ai/score.md)

## Escopo

- Linhas / variantes cobertas (ex.: jogador 1+/2+/3+, time, total)
- O que **não** cobre (link para outro playbook se existir)

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| … | ✅/⚠️ | … |

## Indicadores-chave

- …

## Quando utilizar

- …

## Quando evitar

- …

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| … | + / − / ~ | link [correlacoes.md](../ai/correlacoes.md) |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < N |
| WATCH | N–M |
| BET | ≥ M |

## Checklist IA (mercado)

- [ ] …
- [ ] Odd justa calculada
- [ ] EV > 0
- [ ] Score ≥ limiar BET
- [ ] Correlação do bilhete validada

## Decisão rápida

1. …
2. …
3. BET / WATCH / SKIP
```

---

## Regras de manutenção

1. Um playbook = um mercado (ou família estreita, ex. “SOT jogador + total”).
2. Liquidação só em `markets/`.
3. Pesos globais do Score só em `ai/score.md`; aqui só limiar e deltas.
4. Ao criar playbook, indexar em [README.md](./README.md) e no [README betting](../README.md).
