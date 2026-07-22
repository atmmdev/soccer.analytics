# Análise — Handicap Asiático (Gols)

> **Liquidação (SSOT):** [markets/09-mercados-asiaticos.md — Handicap Asiático Gols](../markets/09-mercados-asiaticos.md#handicap-asiático-gols)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Handicap asiático de gols (Casa/Fora ±0.5, ±1.0, ±1.5, .25/.75)
- PUSH / half win-loss conforme linha — ver markets

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Matriz Poisson completa | ✅ | Cobertura do handicap |
| Linha parseável (Casa/Fora ±X) | ✅ | Sem parse → SKIP no engine |
| Motivação (não perder vs ganhar) | ✅ | Afeta margem |

## Indicadores-chave

- λ casa/fora
- Probabilidade de cobrir a linha
- Odd justa vs casa

## Quando utilizar

- Favorito curto no 1X2 com melhor preço no AH -0.5/-1
- Underdog +0.5/+1 com valor vs modelo

## Quando evitar

- Seleção de handicap não parseada pelo engine
- Linha .25/.75 sem entender half win/loss
- Sample fraca

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| AH -0.5 Casa + Under 3.5 | ~ | Favorito controla |
| AH +0.5 Fora + BTTS | + | Visitante competitivo |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 72 ou sem modelo |
| WATCH | 72–84 |
| BET | ≥ 85 |

## Checklist IA (mercado)

- [ ] Linha interpretada pelo modelo
- [ ] EV > 0 na cobertura
- [ ] Entendimento PUSH da linha
- [ ] Score ≥ 85

## Decisão rápida

1. Handicap modelado? 2. EV > 0? 3. Score ≥ 85 → **BET**.
