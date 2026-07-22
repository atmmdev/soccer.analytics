# Análise — Total Escanteios

> **Liquidação (SSOT):** [markets/03-escanteios.md — Total Escanteios](../markets/03-escanteios.md#total-escanteios)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Over/Under total de escanteios da partida
- Variantes por time / HT: playbooks futuros

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Média cantos pró/contra 10 / casa / fora | ✅ | λ cantos |
| Estilo (cruzamentos, pressão alta) | ✅ | Volume lateral |
| Favorito vs underdog (pressão) | ✅ | Cantos do mandante/favorito |

## Indicadores-chave

- Cantos a favor + sofridos
- Chutes / ataques por faixa
- Odds da linha vs λ Poisson

## Quando utilizar

- Favorito ofensivo vs bloco baixo (muitos cantos)
- Ambos abertos com médias altas

## Quando evitar

- Times de posse central sem cruzar
- Linha já “comida” pelo mercado
- Stats de cantos ausentes (só fallback)

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Over cantos + Over SOT | + | Pressão |
| Over cantos + Under gols | ~ | Volume sem conversão |
| Over cantos + Casa | + | Domínio territorial |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 72 |
| WATCH | 72–84 |
| BET | ≥ 85 |

## Checklist IA (mercado)

- [ ] λ cantos com amostra real
- [ ] EV > 0
- [ ] Estilo de jogo compatível
- [ ] Score ≥ 85

## Decisão rápida

1. Médias reais? 2. Estilo gera cantos? 3. EV + Score ≥ 85 → **BET**.
