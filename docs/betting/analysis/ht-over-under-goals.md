# Análise — Gols 1º Tempo (Over/Under)

> **Liquidação (SSOT):** [markets/08-primeiro-segundo-tempo.md — Gols 1º Tempo](../markets/08-primeiro-segundo-tempo.md#gols-1º-tempo-overunder)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)  
> **Live:** [strategy/live.md](../strategy/live.md)

## Escopo

- Over/Under gols no 1º tempo (linhas 0.5, 1.5, …)
- Não cobre 2º tempo isolado

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Média gols HT | ✅ | λ do período |
| Over 0.5 HT histórico | ✅ | Linha mais líquida |
| Pressão inicial / pressing | ✅ | Volume cedo |

## Indicadores-chave

- % jogos com gol no HT
- xG 1º tempo (se disponível)
- Odds Over 0.5 HT típicas (ver marcado de atuação)

## Quando utilizar

- Ambos atacam cedo
- Live após 15–20’ sem gol com odd boa (strategy/live)

## Quando evitar

- Times que “estudam” o jogo
- Sem split HT nas stats
- Sem modelo de período no engine → não forçar BET

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Over 0.5 HT + Over 2.5 FT | + | Continuidade |
| Under 0.5 HT + Under 2.5 FT | + | Jogo fechado |
| Over 0.5 HT + BTTS | ~ | Gol cedo ≠ ambos |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 72 |
| WATCH | 72–84 |
| BET | ≥ 85 |

## Checklist IA (mercado)

- [ ] Médias HT reais
- [ ] EV > 0
- [ ] Score ≥ 85
- [ ] Contexto live vs pré-jogo explícito

## Decisão rápida

1. Stats HT ok? 2. EV > 0? 3. Score ≥ 85 → **BET**.
