# Value Bet — Valor Esperado, Edge, ROI e CLV

> Guia para identificação e quantificação de apostas de valor

---

## 1. Definição de Value Bet

Uma **value bet** existe quando a probabilidade real estimada é **superior** à probabilidade implícita da odd oferecida:

```
P_real > 1 / Odd  ⟺  EV > 0
```

---

## 2. Expected Value (EV)

```
EV = (P_real × Odd) - 1
```

Expresso em **unidades de stake** (ex.: EV = 0,08 → +8% por aposta repetida).

### Exemplo

| Campo | Valor |
|-------|-------|
| Mercado | Over 2.5 |
| Odd | 2,10 |
| P_real (modelo) | 55% |

```
EV = (0,55 × 2,10) - 1 = 1,155 - 1 = +0,155 (+15,5%)
```

**GREEN** se 3+ gols; lucro = stake × 1,10.

---

## 3. Edge (vantagem)

```
Edge = EV = P_real × Odd - 1
```

Alternativa em pontos percentuais:

```
Edge% = P_real - P_implícita
```

Com odd 2,10: P_impl = 47,6%. Edge% = 55% - 47,6% = **7,4 p.p.**

---

## 4. Thresholds Soccer Analytics

| EV | Recomendação | Score mínimo |
|----|--------------|--------------|
| > 5% | BET | 70 |
| 0% a 5% | WATCH | 50 |
| < 0% | SKIP | — |

Configurável em `getRecommendation()` no Analysis Engine.

---

## 5. ROI (Return on Investment)

```
ROI% = (Lucro_líquido / Total_apostado) × 100
```

### Exemplo — 100 apostas de 1u, EV médio +5%

Resultado esperado a longo prazo: **+5u** → ROI **+5%** (simplificado; variância alta no curto prazo).

---

## 6. Yield

Sinônimo de ROI em apostas esportivas:

```
Yield% = (Lucro / Stake_total) × 100
```

---

## 7. CLV (Closing Line Value)

Comparar odd apostada com odd de fechamento:

```
CLV = (Odd_apostada / Odd_fechamento) - 1
```

| CLV médio | Interpretação |
|-----------|---------------|
| > 0 | Edge real provável |
| ≈ 0 | Mercado eficiente |
| < 0 | Apostando pior que o mercado |

### Exemplo

Apostou Over 2.5 @ **2,05**. Fechou @ **1,90**.

```
CLV = (2,05 / 1,90) - 1 = +7,9%
```

Boa entrada — mercado moveu a favor.

---

## 8. Kelly Criterion (gestão de stake)

Fração ótima teórica da bankroll:

```
f* = (P_real × Odd - 1) / (Odd - 1)
```

### Exemplo

P = 55%, Odd = 2,10

```
f* = (0,55 × 2,10 - 1) / (2,10 - 1) = 0,155 / 1,10 = 14,1% da banca
```

**Uso prático:** Kelly fracionado (¼ Kelly) → ~3,5% da banca.

---

## 9. Fair odd vs odd da casa

| Conceito | Fórmula |
|----------|---------|
| Fair odd | 1 / P_real |
| Odd mínima value 5% | Fair × 1,05 |
| P implícita | 1 / Odd_casa |

Se `Odd_casa > Fair × (1 + EV_min)` → value.

---

## 10. Exemplo completo — Bilhete simples

**Jogo:** Arsenal vs Brighton  
**Mercado:** BTTS Sim @ 1,75  
**P_real:** 62% (Poisson + histórico)  
**P_impl:** 57,1%

```
EV = 0,62 × 1,75 - 1 = +8,5%
Fair odd = 1,61
Edge% = 4,9 p.p.
```

Score IA: 78 → **BET**  
Stake sugerido: 2u (Kelly fracionado)

---

## 11. Múltiplas e EV

```
EV_combinada ≈ Π(1 + EV_i) - 1  (aproximação)
Odd_combinada = Π Odd_i
```

**Atenção:** correlação positiva infla risco — ver [correlacoes.md](./correlacoes.md).

---

## 12. Quando NÃO é value (mesmo “sentindo”)

- Sem modelo ou dados (só palpite)
- Odd já reflete notícia (lesão precificada)
- Mercado ilíquido com odd stale
- EV marginal < margem de erro do modelo

---

## Referências

- [probabilidades.md](./probabilidades.md)
- [score.md](./score.md)
- [glossary.md](../knowledge/glossary.md)
