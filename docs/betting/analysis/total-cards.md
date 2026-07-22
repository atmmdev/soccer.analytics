# Análise — Total Cartões

> **Liquidação (SSOT):** [markets/04-cartoes-faltas.md — Total Cartões](../markets/04-cartoes-faltas.md#total-cartões)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Over/Under cartões da partida (amarelo=1, vermelho conforme casa)
- Árbitro é crítico neste mercado

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Árbitro (média cartões) | ✅ | Maior driver |
| Derby / stakes / rivalidade | ✅ | Intensidade |
| Faltas médias dos times | ✅ | Correlaciona com cartões |
| Cartões médios 10 / casa / fora | ✅ | λ base |

## Indicadores-chave

- Cards/jogo árbitro e times
- Faltas cometidas
- Importância da partida

## Quando utilizar

- Árbitro rigoroso + jogo tenso
- Ambos físicos / muitos desarmes

## Quando evitar

- Árbitro permissivo desconhecido
- Amistoso / ritmo baixo
- Sem dado de árbitro (penalizar score)

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Over cartões + Under gols | ~ | Jogo travado |
| Over cartões + faltas | + | Mesmo perfil |
| Over cartões + derby | + | Contexto |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 75 |
| WATCH | 75–86 |
| BET | ≥ 87 |

## Checklist IA (mercado)

- [ ] Árbitro conhecido ou score penalizado
- [ ] λ cartões + EV > 0
- [ ] Contexto de tensão ok
- [ ] Score ≥ 87

## Decisão rápida

1. Árbitro + intensidade? 2. EV > 0? 3. Score ≥ 87 → **BET**.
