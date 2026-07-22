# Análise — Resultado Final (1X2)

> **Liquidação (SSOT):** [markets/01-resultados.md — Resultado Final](../markets/01-resultados.md#resultado-final)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Casa / Empate / Fora (90 min + acréscimos)
- Não cobre dupla chance, HT/FT, handicap europeu (playbooks futuros)

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| λ gols / matriz Poisson | ✅ | Base 1X2 no Analysis Engine |
| Forma casa vs fora | ✅ | Assimetria de mando |
| Motivação / jogo morto | ✅ | Altera empate vs vitória |
| Desfalques chave | ✅ | Muda λ e estilo |

## Indicadores-chave

- xG / gols pró-contra 10 jogos
- % vitórias casa / fora
- H2H recente (secundário)
- Odd justa vs casa

## Quando utilizar

- Favorito claro com EV > 0 na linha principal
- Underdog com odd inchada vs modelo

## Quando evitar

- Empate “por default” sem edge
- Lineup incerto em favorito curto
- Fallback de médias da liga sem histórico

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Casa + Under 2.5 | ~ | Favorito baixo placar |
| Casa + BTTS Não | + | Domínio sem sofrer |
| Casa + Over 2.5 | + | Favorito ofensivo |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 70 |
| WATCH | 70–84 |
| BET | ≥ 85 |

## Checklist IA (mercado)

- [ ] Matriz Poisson / 1X2 calculada (não fallback cego)
- [ ] EV > 0 na seleção
- [ ] Motivação e escalação ok
- [ ] Score ≥ 85
- [ ] Correlação do bilhete

## Decisão rápida

1. Modelo real? 2. EV > 0? 3. Score ≥ 85 → **BET**.
