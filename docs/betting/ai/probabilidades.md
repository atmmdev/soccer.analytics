# Probabilidades — Odds, Margem e Odds Justas

> Fundamentos matemáticos para agentes de IA · Soccer Analytics

---

## 1. Probabilidade implícita

A odd decimal **d** reflete a estimativa da casa (com margem):

```
P_implícita = 1 / d
```

### Exemplos

| Odd | P implícita |
|-----|-------------|
| 1.50 | 66,67% |
| 2.00 | 50,00% |
| 2.50 | 40,00% |
| 3.00 | 33,33% |
| 5.00 | 20,00% |

---

## 2. Probabilidade real (modelada)

Estimada por modelo (Poisson, histórico, xG):

```
P_real = f(estatísticas, contexto)
```

No Soccer Analytics, para gols:

```
λ_casa, λ_fora → matriz de placares → P(Over 2.5), P(BTTS), P(1X2)
```

---

## 3. Odd justa (fair odd)

```
Fair_Odd = 1 / P_real
```

Se `P_real = 0,55` → `Fair_Odd = 1,82`

---

## 4. Margem da casa (overround)

Para mercado com n desfechos e odds `d_i`:

```
Margem = Σ(1/d_i) - 1
```

### Exemplo 1X2

| Seleção | Odd |
|---------|-----|
| Casa | 2.10 |
| Empate | 3.40 |
| Fora | 3.60 |

```
Soma = 1/2.10 + 1/3.40 + 1/3.60 = 0.476 + 0.294 + 0.278 = 1.048
Margem = 4,8%
```

### Remover margem (normalização proporcional)

```
P_justa_i = (1/d_i) / Σ(1/d_j)
```

---

## 5. Transformar probabilidade em odd

```
Odd_justa = 1 / P
Odd_com_margem_m = 1 / (P × (1 + m))
```

Ex.: P = 40%, margem 5% → `Odd = 1 / (0,40 × 1,05) = 2,38`

---

## 6. Distribuição de Poisson (gols)

```
P(k gols) = (λ^k × e^(-λ)) / k!
```

**P(Over 2.5)** = 1 - P(0) - P(1) - P(2)

### Exemplo

λ_total = 2,8 (soma xG dos times)

| k | P(k) |
|---|------|
| 0 | 0,061 |
| 1 | 0,170 |
| 2 | 0,238 |
| **≤2** | **0,469** |
| **Over 2.5** | **0,531** |

Fair odd Over 2.5 ≈ **1,88**

---

## 7. Handicap e probabilidade acumulada

Handicap Casa -1.5: vitória por **2+ gols** de diferença.

```
P = Σ P(placar h-a) para todos h-a ≥ 2
```

Via matriz Poisson no Analysis Engine.

---

## 8. Props de jogador (anytime)

Modelo simplificado:

```
λ_jogador = (gols/90) × minutos_esperados × fator_xG_time
P(marcar) = 1 - e^(-λ_jogador)
```

---

## 9. Tabela de referência rápida

| P real | Fair odd | EV+ se odd ≥ |
|--------|----------|--------------|
| 90% | 1,11 | 1,17 (5% EV) |
| 80% | 1,25 | 1,31 |
| 70% | 1,43 | 1,50 |
| 60% | 1,67 | 1,75 |
| 50% | 2,00 | 2,10 |
| 40% | 2,50 | 2,63 |
| 30% | 3,33 | 3,50 |
| 20% | 5,00 | 5,25 |
| 10% | 10,00 | 10,50 |

`Odd_mínima = Fair_Odd × (1 + EV_desejado)`

---

## 10. Erros comuns (evitar)

| Erro | Correção |
|------|----------|
| Usar P implícita como P real | Modelar separadamente |
| Ignorar margem em 1X2 | Normalizar as três vias |
| Poisson com λ < 0.3 em jogos defensivos | Ajustar com xGA |
| Odd de múltipla como média | Produto das odds |

---

## Referências

- [value-bet.md](./value-bet.md) — EV e edge
- [score.md](./score.md) — confiança
- Analysis Engine: `apps/api/src/engines/analysis-engine/`
