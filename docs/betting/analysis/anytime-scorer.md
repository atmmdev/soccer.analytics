# Análise — Anytime Marcador

> **Liquidação (SSOT):** [markets/07-marcadores.md — Anytime Marcador](../markets/07-marcadores.md#anytime-marcador-qualquer-momento)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Jogador marca ≥ 1 gol na partida
- Não cobre primeiro/último marcador / hat-trick

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Titular + minutos esperados | ✅ | Sem minutos = SKIP |
| Gols/90, xG/90 | ✅ | Player Engine |
| Papel (CA vs extremo) | ✅ | Volume de finalização |
| Adversário concede gols/xGA | ✅ | Oportunidade |

## Indicadores-chave

- Gols e xG recentes
- Penaltis (se cobrador)
- λ time × share do jogador

## Quando utilizar

- Titular ofensivo com modelo Player Engine
- Favorito em casa, linha com EV

## Quando evitar

- Sem modelo (`playerModel` falso) → **SKIP** no engine
- Reserva / lesão / rotação
- Odd só pela fama sem xG

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Anytime + Casa | + | Favorito marca |
| Anytime + Over 2.5 | + | Mais gols no jogo |
| Anytime + SOT 1+ mesmo jogador | ++ | Quase nested |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 75 ou sem modelo |
| WATCH | 75–86 |
| BET | ≥ 87 |

## Checklist IA (mercado)

- [ ] Escalação confirmada
- [ ] `hasModel` / playerModel true
- [ ] EV > 0
- [ ] Score ≥ 87
- [ ] Correlação (evitar nested com SOT do mesmo)

## Decisão rápida

1. Titular + modelo? 2. EV > 0? 3. Score ≥ 87 → **BET**; senão **SKIP**.
