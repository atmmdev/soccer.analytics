# Análise — Intervalo/Final (HT/FT)

> **Liquidação (SSOT):** [markets/01-resultados.md — Intervalo/Final](../markets/01-resultados.md#intervalofinal)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Combinação resultado HT + resultado FT (ex.: Empate/Casa)
- Alta dificuldade; correlação temporal forte

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Matriz / probs HT e FT | ✅ | Produto condicional |
| Perfis “vira no 2º” | ✅ | Comeback rates |
| Motivação | ✅ | Pressão no 2º tempo |

## Indicadores-chave

- Frequência Empate/Casa, Casa/Casa, etc.
- Gols HT vs FT do favorito
- Odd justa << odd casa (margem alta)

## Quando utilizar

- Só com edge claro e amostra boa
- Favorito que costuma empatar HT e virar

## Quando evitar

- Sem modelo HT → **SKIP**
- Bilhete múltiplo já correlacionado
- Odd “bonita” sem EV

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| HT/FT + Over 1.5 | + | Precisa gols |
| HT/FT + outras pontas 1X2 | ++ | Evitar |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 80 |
| WATCH | 80–89 |
| BET | ≥ 90 |

## Checklist IA (mercado)

- [ ] Modelo cobre HT e FT
- [ ] EV > 0 após margem
- [ ] Score ≥ 90
- [ ] Correlação do bilhete limpa

## Decisão rápida

1. Modelo HT+FT? 2. EV real? 3. Score ≥ 90 → **BET**; senão SKIP.
