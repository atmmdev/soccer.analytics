# Análise — Chance Dupla

> **Liquidação (SSOT):** [markets/01-resultados.md — Chance Dupla](../markets/01-resultados.md#chance-dupla)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- 1X / X2 / 12 (duas das três pontas do 1X2)
- Derivado da matriz Poisson / 1X2

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Probabilidades 1X2 do modelo | ✅ | Soma das pontas |
| Motivação (não perder) | ✅ | Valoriza 1X / X2 |

## Indicadores-chave

- P(Casa)+P(Empate) etc.
- Odd justa da dupla vs casa
- Draw risk do favorito

## Quando utilizar

- Favorito com odd curta no 1X2 → 1X com melhor Kelly/risco
- Visitante competitivo → X2 com value

## Quando evitar

- EV ≤ 0 após margem da casa na dupla
- Preferir 1X2 puro quando edge estiver na ponta única

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| 1X + Under 2.5 | + | Favorito controla |
| X2 + BTTS | + | Visitante marca |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 70 |
| WATCH | 70–84 |
| BET | ≥ 85 |

## Checklist IA (mercado)

- [ ] Soma 1X2 coerente
- [ ] EV > 0 na dupla
- [ ] Score ≥ 85

## Decisão rápida

1. Calcular P(dupla) do modelo. 2. EV > 0? 3. Score ≥ 85 → **BET**.
