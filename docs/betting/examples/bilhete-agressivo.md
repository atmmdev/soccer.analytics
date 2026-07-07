# Exemplo — Bilhete Agressivo

> **Perfil:** alto risco / alto retorno · **Objetivo:** capturar zebras e combos com edge marginal  
> **Stake sugerido:** 0,5–1% da banca · **Odd combinada:** 19,66

---

## Composição do bilhete

| # | Jogo | Mercado | Seleção | Odd | EV est. | Score IA |
|---|------|---------|---------|-----|---------|----------|
| 1 | Leicester vs Southampton | 1X2 | Fora | 4,20 | +12% | 68 |
| 2 | Lens vs Monaco | Over/Under | Over 3.5 | 2,40 | +9% | 70 |
| 3 | Sporting vs Benfica | Combo | BTTS Sim + Over 2.5 | 1,95 | +8% | 72 |

**Odd combinada:** 4,20 × 2,40 × 1,95 = **19,66**  
**Stake:** 0,5u · **Retorno potencial:** 9,83u · **Lucro:** 9,33u  
**Probabilidade implícita:** ~5,1%

---

## Por que foi escolhido

### Seleção 1 — Southampton Fora @ 4,20

- Southampton **4 vitórias** nos últimos 6 fora (Championship push).
- Leicester xGA casa **1,45** últimos 10; forma irregular WDLDL.
- P(Fora) modelo: **28%** vs implícita 23,8% → fair odd **3,57**.

### Seleção 2 — Over 3.5 Lens vs Monaco @ 2,40

- Ligue 1 aberta: λ total **3,6** (Lens 1,9 + Monaco 1,7 xG médios).
- H2H: **4/5** Over 3.5.
- P(Over 3.5) = **46%** vs implícita 41,7%.

### Seleção 3 — BTTS + Over 2.5 Sporting vs Benfica @ 1,95

- Derby **7/10** BTTS; média **3,2 gols**.
- P(combo) ≈ P(BTTS) × P(Over|BTTS) ≈ 0,62 × 0,85 = **52%** vs implícita 51,3%.
- Edge fino — seleção por valor de entretenimento analítico no derby.

---

## Estatísticas que justificam

| Indicador | Leicester-SOU | Lens-Monaco | Sporting-Benfica |
|-----------|---------------|-------------|------------------|
| xG total | 2,8 | 3,6 | 3,2 |
| Over 3.5 % | 35% | 80% | 55% |
| BTTS % | 50% | 65% | 70% |
| Forma visitante | — | — | — |
| Forma fora SOU | WWWLW | — | — |

---

## Riscos

| Risco | Nível | Detalhe |
|-------|-------|---------|
| Variância 3 pernas | **Muito alto** | P(acertar tudo) ~5% |
| Leicester favorito casa | Alto | Modelo pode superestimar visitante |
| Over 3.5 | Alto | 3 gols = RED |
| Combo correlacionado | **Alto** | BTTS+Over mesma partida |
| Stake emocional derby | Médio | Disciplina de banca |

**Probabilidade estimada de GREEN:** ~6–8% (modelo) vs 5,1% implícita — edge real **marginal** na combinada.

---

## Correlação entre mercados

| Par | Correlação |
|-----|------------|
| Perna 1 × 2 | Neutra |
| Perna 1 × 3 | Neutra |
| Perna 2 × 3 | Neutra |
| BTTS + Over (perna 3 interna) | **++** |

```
Penalidade Score IA: -8% por combo correlacionado
Score bruto: 70 → Score ajustado: 65 (Moderado)
```

---

## Score IA do bilhete

| Componente | Valor |
|------------|-------|
| Média scores | 70 |
| Penalidade correlação combo | -8% |
| Penalidade variância 3 pernas agressivas | -5% |
| **Score final** | **65** |

Recomendação sistema: **WATCH** na combinada · **BET** possível só na perna 1 isolada (EV 12%).

---

## Valor esperado

| Abordagem | EV |
|-----------|-----|
| Perna 1 isolada | +12% ✅ |
| Perna 2 isolada | +9% ✅ |
| Perna 3 isolada | +8% (combo) ⚠️ |
| **Combinada** | **Incerto** — correlação e variância destroem edge teórico |

**Regra:** bilhetes agressivos são **entretenimento + experimento**; stake máximo **0,5%**.

---

## Liquidação possível

| Cenário | Resultado |
|---------|-----------|
| 3 GREEN | +9,33u (raro) |
| Qualquer RED | -0,5u |
| 2-0 Sporting, Benfica não marca | Perna 3 RED |

---

## Checklist executado

- [x] Stake ≤ 1% banca
- [x] Edge identificado em pelo menos 1 perna isolada
- [x] Correlação documentada
- [ ] **Não** recomendado para bankroll principal
- [x] Registrado como aposta "agressiva" no journal

---

## Alternativa sugerida (mesmo edge, menos risco)

| Aposta simples | Odd | EV |
|----------------|-----|-----|
| Southampton Fora | 4,20 | +12% |
| Over 3.5 Lens-Monaco | 2,40 | +9% |

Duas **simples** separadas preservam edge sem multiplicar variância.

---

## Referências

- [../ai/value-bet.md](../ai/value-bet.md) — Kelly fracionado
- [../ai/correlacoes.md](../ai/correlacoes.md)
- [bilhete-moderado.md](./bilhete-moderado.md)
- [bilhete-conservador.md](./bilhete-conservador.md)
