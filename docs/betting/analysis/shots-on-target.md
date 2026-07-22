# Análise — Chutes no Gol (SOT)

> **Liquidação (SSOT):** [markets/05-chutes.md — Chutes no Gol](../markets/05-chutes.md#chutes-no-gol-sot--shots-on-target)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Jogador 1+ / 2+ / 3+ chutes no gol
- Time X+ chutes no gol
- Total da partida (Over/Under SOT)

Não cobre: chutes totais / bloqueados / fora — ver outros títulos em `05-chutes.md`.

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Média de chutes e SOT do jogador/time | ✅ | Base do λ |
| xG / taxa SOT÷shots | ✅ | Qualidade da finalização |
| Minutos jogados / titular | ✅ | Props de jogador |
| Adversário permite SOT? | ✅ | Volume enfrentado |
| Formação / papel (CA, ponta, meia) | ✅ | Expectativa de chutes |

## Indicadores-chave

- Média SOT (10 jogos, casa, fora)
- xG e conversão
- Minutos e escalação confirmada
- Pressão do adversário (SOT sofridos)
- Goleiro titular adversário (impacta gols, não o SOT em si)

## Quando utilizar

- Centroavantes e pontas que finalizam muito
- Favorito em casa com volume ofensivo
- xG alto com conversão ainda baixa (SOT costuma aparecer)

## Quando evitar

- Jogador recuado / pouca box presence
- Jogo equilibrado de baixa finalização
- Atacante retornando de lesão (minutos limitados)
- Só chutes de longe (shots altos, SOT baixo)

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Vitória + jogador 2+ SOT | + | Mesmo domínio territorial |
| Over 2.5 gols + jogador 2+ SOT | + | Volume ofensivo conjunto |
| Jogador 2+ SOT + goleiro adv. Over defesas | + | SOT alimenta saves — ver [goalkeeper-saves.md](./goalkeeper-saves.md) |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 70 |
| WATCH | 70–84 |
| BET | ≥ 85 |

## Checklist IA (mercado)

- [ ] Escalação confirmada (jogador titular ou minutos esperados)
- [ ] Médias 10 / casa / fora coletadas
- [ ] Adversário concede SOT acima da linha implícita
- [ ] Odd justa + EV > 0
- [ ] Score ≥ 85 para BET
- [ ] Correlação do bilhete validada

## Decisão rápida

1. Pipeline universal completo?
2. Delta SOT ok (minutos + adversário)?
3. EV > 0 e Score ≥ 85 → **BET**; senão WATCH/SKIP.
