# Análise — Defesas do goleiro

> **Liquidação (SSOT):** [markets/10-outros-mercados.md — Total Defesas do Goleiro](../markets/10-outros-mercados.md#total-defesas-do-goleiro)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)  
> **Correlacionado:** [shots-on-target.md](./shots-on-target.md)

## Escopo

- Over/Under defesas do goleiro (um time ou total, conforme linha da casa)
- Variantes por goleiro titular

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| SOT sofridos / pressão no gol | ✅ | Defesas ≈ f(SOT adversário) |
| Goleiro titular confirmado | ✅ | Reserva muda perfil |
| Média saves 10 / casa / fora | ✅ | Base histórica |
| Formação adversária (volume de finalização) | ✅ | Expectativa de chutes no gol |
| Lesões no ataque adversário | ⚠️ | Reduz SOT e saves |

## Indicadores-chave

- Saves/jogo e SOT faced
- xSV / PSxG (se disponível)
- Pressão territorial do adversário
- Clima/campo só se fonte confiável (pipeline ⚠️)

## Quando utilizar

- Goleiro elite vs ataque que finaliza muito
- Edge em volume (SOT) sem edge em Over gols
- Favorito visitante pressiona, mandante defende baixo bloco com chutes

## Quando evitar

- Jogo projetado sem chutes (Under shots/SOT)
- Goleiro dúvida / possível reserva
- Linha de saves desalinhada da projeção de SOT

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| Over defesas + Over SOT adversário | ++ | Quase a mesma hipótese |
| Over defesas + Under gols | ~ / + | Volume sem conversão |
| Over defesas + vitória do ataque | + | Domínio com finalizações |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 75 |
| WATCH | 75–86 |
| BET | ≥ 87 |

## Checklist IA (mercado)

- [ ] Time sofrerá pressão? (SOT adversário projetado)
- [ ] Adversário finaliza muito?
- [ ] Goleiro titular?
- [ ] Médias 10 / casa / fora
- [ ] Odd justa + Value Bet
- [ ] Formação / lesões consideradas
- [ ] Score ≥ 87 para BET

## Decisão rápida

1. Projeção de SOT adversário > linha de saves?
2. Titular confirmado?
3. EV > 0 e Score ≥ 87 → **BET**.
