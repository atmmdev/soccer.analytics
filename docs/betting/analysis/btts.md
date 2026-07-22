# Análise — Ambas Marcam (BTTS)

> **Liquidação (SSOT):** [markets/02-gols.md — Ambas Marcam](../markets/02-gols.md#ambas-marcam-btts)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- BTTS Sim / Não (partida completa)
- Não cobre BTTS por tempo

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| % ambos marcam (casa/fora) | ✅ | Base empírica |
| xG pró e xGA ambos | ✅ | Qualidade ofensiva/defensiva |
| Estilo (bloco baixo vs aberto) | ✅ | Afeta “Não” |

## Indicadores-chave

- BTTS últimos 10
- Gols sofridos do favorito
- Clean sheets recentes
- Probabilidade Poisson P(home≥1 ∧ away≥1)

## Quando utilizar

- Ambos atacam e concedem
- Favorito frágil defensivamente vs ataque médio

## Quando evitar

- Favorito sólido + visitante sem volume
- “Jogo morto” com ritmo baixo
- Odd Sem edge vs modelo

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| BTTS Sim + Over 2.5 | ++ | Quase mesma hipótese |
| BTTS Sim + Casa | + | Favorito marca e sofre |
| BTTS Não + Under 2.5 | ++ | Perfil fechado |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 70 |
| WATCH | 70–84 |
| BET | ≥ 85 |

## Checklist IA (mercado)

- [ ] P(BTTS) do modelo vs implícita
- [ ] EV > 0
- [ ] Não acumular BTTS Sim + Over sem necessidade (correlação ++)
- [ ] Score ≥ 85

## Decisão rápida

1. Ambos têm λ ofensiva crível? 2. EV > 0? 3. Score ≥ 85 → **BET**.
