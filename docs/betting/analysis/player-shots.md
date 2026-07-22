# Análise — Chutes do Jogador

> **Liquidação (SSOT):** [markets/06-estatisticas-jogador.md — Chutes do Jogador](../markets/06-estatisticas-jogador.md#chutes-do-jogador)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)  
> **Relacionado:** [shots-on-target.md](./shots-on-target.md)

## Escopo

- Over/Under finalizações do jogador (shots), linhas 1+, 2+, 3+, …
- Distinto de SOT (qualidade no gol)

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Média shots/90 e últimos 10 | ✅ | Base |
| Titular / minutos | ✅ | Volume |
| Papel tático + adversário | ✅ | Oportunidades |
| Modelo Player Engine | ✅ | Sem modelo → SKIP no engine |

## Indicadores-chave

- Shots/90, touches in box
- Adversário concede shots
- Escalação

## Quando utilizar

- Extremo/CA com alto volume de finalização
- Favorito em casa

## Quando evitar

- Meia defensivo
- Sem `playerModel`
- Nested com SOT do mesmo sem diversificar

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Shots 2+ + SOT 1+ | ++ | Nested parcial |
| Shots + Over cantos | + | Pressão |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 75 ou sem modelo |
| WATCH | 75–86 |
| BET | ≥ 87 |

## Checklist IA (mercado)

- [ ] Titular confirmado
- [ ] hasModel
- [ ] EV > 0
- [ ] Score ≥ 87

## Decisão rápida

1. Modelo + minutos? 2. EV > 0? 3. Score ≥ 87 → **BET**.
