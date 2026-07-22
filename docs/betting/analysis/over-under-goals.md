# Análise — Over/Under gols

> **Liquidação (SSOT):** [markets/02-gols.md — Over/Under Gols](../markets/02-gols.md#overunder-gols)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Over/Under gols da partida (linhas clássicas 0.5–4.5 e alternativas)
- Não cobre BTTS / placar exato (playbooks futuros)

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| λ gols casa/fora (Poisson) | ✅ | Modelo core do Analysis Engine |
| xG / xGA | ✅ | Qualidade além do placar |
| Motivação / jogo morto | ✅ | Altera ritmo |
| Desfalques ofensivos/defensivos | ✅ | Muda λ |

## Indicadores-chave

- Médias gols pró/contra 10 / casa / fora
- xG, BTTS histórico (contexto)
- Odds da linha vs odd justa do modelo

## Quando utilizar

- Divergência clara modelo × mercado (EV > 0)
- Ambos atacam / ambos vulneráveis (Over)
- Baixo xG e blocos baixos (Under)

## Quando evitar

- Amostra fina + fallback de médias da liga
- Contexto cup/rotación sem lineup
- Linha já precificada no modelo (EV ~ 0)

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Over 2.5 + BTTS | + | Ver correlações |
| Over 2.5 + SOT jogador | + | Volume ofensivo |
| Under 2.5 + Over cartões | ~ | Perfis diferentes |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 70 |
| WATCH | 70–84 |
| BET | ≥ 85 |

## Checklist IA (mercado)

- [ ] λ / xG coletados (não só fallback silencioso)
- [ ] Odd justa + EV > 0
- [ ] Importância da partida
- [ ] Score ≥ 85
- [ ] Correlação do bilhete

## Decisão rápida

1. Modelo real (não fallback)?
2. EV > 0?
3. Score ≥ 85 → **BET**.
