# Análise — Primeiro Marcador

> **Liquidação (SSOT):** [markets/07-marcadores.md — Primeiro Marcador](../markets/07-marcadores.md#primeiro-marcador)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Jogador marca o **primeiro** gol da partida
- Mais difícil que anytime (ordem importa)

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Titular + minutos desde o início | ✅ | Precisa estar em campo no 1º gol |
| Taxa de primeiro gol do time × share | ✅ | Quem abre o placar |
| Anytime do mesmo jogador | ✅ | P(first) < P(anytime) |

## Indicadores-chave

- Gols/90 e % gols como primeiro do time
- Penaltis
- Favorito marca primeiro com frequência?

## Quando utilizar

- CA titular de favorito com modelo forte
- Odd first >> anytime com edge real na ordem

## Quando evitar

- Sem modelo de ordem (só anytime) → **SKIP** ou WATCH
- Reserva / entra no 2º tempo
- Nested com anytime do mesmo no bilhete

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| First + Casa | + | Favorito abre |
| First + Anytime mesmo jogador | ++ | Nested — evitar |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 80 ou sem modelo de ordem |
| WATCH | 80–88 |
| BET | ≥ 89 |

## Checklist IA (mercado)

- [ ] Titular do 1º minuto
- [ ] Modelo distingue first vs anytime
- [ ] EV > 0
- [ ] Score ≥ 89

## Decisão rápida

1. Modelo de ordem? 2. Titular? 3. EV + Score ≥ 89 → **BET**.
