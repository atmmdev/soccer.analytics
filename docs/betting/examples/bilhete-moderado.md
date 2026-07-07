# Exemplo — Bilhete Moderado

> **Perfil:** risco médio · **Objetivo:** combinar edge em ligas distintas com variância controlada  
> **Stake sugerido:** 1,5% da banca · **Odd combinada:** 5,82

---

## Composição do bilhete

| # | Jogo | Mercado | Seleção | Odd | EV est. | Score IA |
|---|------|---------|---------|-----|---------|----------|
| 1 | Liverpool vs Tottenham | Over/Under | Over 2.5 | 1,72 | +8,1% | 76 |
| 2 | Real Sociedad vs Girona | BTTS | Sim | 1,65 | +7,4% | 74 |
| 3 | Ajax vs PSV | 1X2 | Casa | 2,05 | +6,2% | 71 |

**Odd combinada:** 1,72 × 1,65 × 2,05 = **5,82**  
**Stake:** 1,5u · **Retorno potencial:** 8,73u · **Lucro:** 7,23u  
**Probabilidade implícita combinada:** ~17,2%

---

## Por que foi escolhido

### Seleção 1 — Over 2.5 Liverpool vs Tottenham @ 1,72

- xG combinado últimos 5 H2H: **3,4 gols/jogo**.
- Liverpool Over 2.5 em **8/10** em casa; Tottenham concede xGA 1,55 fora.
- λ Poisson total: **3,1** → P(Over 2.5) = **62%** vs implícita 58,1%.
- Lesão zagueiro visitante não totalmente precificada (odd caiu de 1,78 para 1,72).

### Seleção 2 — BTTS Sim Real Sociedad vs Girona @ 1,65

- Ambos marcam em **6/8** H2H recentes.
- xG casa **1,6** · xG fora Girona **1,4** · xGA ambos **> 1,3**.
- P(BTTS) modelo: **64%** vs implícita 60,6%.

### Seleção 3 — Ajax Casa vs PSV @ 2,05

- Derby **De Klassieker**; Ajax **70%** vitórias em casa vs PSV (últimos 20).
- PSV xGA fora **1,5** em jogos top-4.
- P(Casa) Poisson + forma: **52%** vs implícita 48,8% · Fair odd **1,92**.

---

## Estatísticas que justificam

| Indicador | Liverpool-Tottenham | Sociedad-Girona | Ajax-PSV |
|-----------|---------------------|-----------------|----------|
| xG total esperado | 3,1 | 2,8 | 2,9 |
| Over 2.5 % (10j) | 80% | — | 65% |
| BTTS % (10j) | 70% | 75% | 55% |
| xG casa / fora | 2,0 / 1,1 | 1,6 / 1,4 | 1,8 / 1,2 |
| Forma (últ. 5) | WWWDW / WLWDW | WDWWL / LWWDL | WWLWW / WDLWW |

---

## Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Liverpool 2-0 e administra | Over 2.5 RED | xG alto ainda favorece 3º gol |
| Girona não marca | BTTS RED | Sociedad marca em 90% casa |
| PSV contra-ataque eficiente | Ajax RED | Casa pressiona; H2H favorável |
| 3 pernas — 1 RED mata bilhete | Alto | Stake 1,5% apenas |
| Cartões/expulsão derby | Variância | Monitorar escalação |

---

## Correlação entre mercados

| Par de pernas | Correlação | Nota |
|---------------|------------|------|
| LIV-TOT × SOC-GIR | Neutra | Ligas/países diferentes |
| LIV-TOT × AJAX-PSV | Neutra | Horários distintos |
| SOC-GIR × AJAX-PSV | Neutra | — |
| Over 2.5 + BTTS (mesmo jogo) | **++** | **Não aplicável** — jogos separados |

**Penalidade correlação bilhete:** 1,00

---

## Score IA do bilhete

| Perna | Score | Peso |
|-------|-------|------|
| Over 2.5 | 76 | 33% |
| BTTS | 74 | 33% |
| Ajax 1 | 71 | 33% |

```
Média: 73,7 → Score bilhete: 74 (Forte)
Penalidade correlação: nenhuma
Recomendação: BET com stake moderado
```

---

## Valor esperado

```
EV por perna: +8,1% | +7,4% | +6,2%
EV combinado aproximado: (1,081 × 1,074 × 1,062) - 1 ≈ +23,2%
```

> EV combinado **superestima** edge real — pernas não são independentes no sentido de variância. Usar EV por perna como referência principal.

**Kelly fracionado (¼):** ~2,8% → stake real **1,5%** (conservador dentro do cálculo).

---

## Liquidação possível

| Cenário | Resultado |
|---------|-----------|
| 3 GREEN | Lucro 7,23u |
| 2 GREEN, 1 RED | Perda 1,5u |
| Void 1 perna | Odd recalculada nas 2 restantes |

---

## Checklist executado

- [x] Escalações confirmadas (24h)
- [x] EV > 5% em cada perna
- [x] Score IA ≥ 70 em cada perna
- [x] Correlação entre jogos validada
- [x] Analysis Engine / Poisson executado
- [x] CLV registrado no momento da aposta

---

## Referências

- [../markets/02-gols.md](../markets/02-gols.md) — Over 2.5, BTTS
- [../markets/01-resultados.md](../markets/01-resultados.md) — 1X2
- [../ai/correlacoes.md](../ai/correlacoes.md)
- [../ai/value-bet.md](../ai/value-bet.md)
- [bilhete-conservador.md](./bilhete-conservador.md)
