# Exemplo — Bilhete Placares

> **Perfil:** altíssima variância · **Mercado:** Resultado Correto  
> **Stake sugerido:** 0,25–0,5% da banca · **Odd alvo:** 6,00+

---

## Composição (simples)

| Jogo | Mercado | Seleção | Odd | P modelo | EV | Score IA |
|------|---------|---------|-----|----------|-----|----------|
| Atalanta vs Verona | Placar Exato | 2-0 | 8,50 | 14,0% | +19% | 62 |

**Stake:** 0,25u · **Retorno potencial:** 2,125u · **Lucro:** 1,875u

---

## Por que foi escolhido

- Atalanta em casa: **5 vitórias 2-0** nos últimos 20 jogos em Bergamo.
- Verona xG fora **0,72**; não marca em **40%** dos jogos fora.
- λ_casa **2,1** · λ_fora **0,65** (Poisson).
- P(2-0) = célula matriz **13,8%** → fair odd **7,25**; casa oferece **8,50**.

---

## Estatísticas que justificam

| Indicador | Atalanta | Verona |
|-----------|----------|--------|
| xG casa (10j) | 2,05 | — |
| xG fora (10j) | — | 0,71 |
| xGA fora Verona | — | 1,82 |
| Placar 2-0 freq. casa | 25% | — |
| Under 0.5 fora Verona | 40% | — |
| Clean sheet casa Atalanta | 35% | — |

### Matriz Poisson (trecho)

| Placar | P |
|--------|---|
| 2-0 | 13,8% |
| 1-0 | 16,2% |
| 3-0 | 9,1% |
| 2-1 | 10,4% |
| 0-0 | 8,9% |

---

## Riscos

| Risco | Detalhe |
|-------|---------|
| Gol visitante | Qualquer gol Verona → **RED** |
| Placar 3-0, 2-1 | RED (não é 2-0) |
| Gol anulado VAR | Liquidação final |
| Atalanta rota elenco | λ cai |
| Variância | Mesmo com edge, hit rate ~14% |

**Expectativa:** ~7 REDs para cada GREEN a longo prazo.

---

## Correlação

N/A — aposta simples. Não combinar com **Under 2.5** ou **Casa -1** na mesma múltipla sem calcular overlap:

| Perna adicional | Overlap com 2-0 |
|-----------------|-----------------|
| Casa vence | ++ (2-0 ⊂ Casa) |
| Under 2.5 | — (2-0 é Under) |
| BTTS Não | ++ |
| Verona Over 0.5 | — (oposto) |

---

## Score IA: 62 (Moderado)

| Fator | Nota |
|-------|------|
| Modelo Poisson | Adequado |
| Amostra placares | Boa |
| Mercado volátil | Penalidade -15 |
| EV alto | +10 |

Placar exato = **WATCH/BET** só com stake mínimo.

---

## Valor esperado

```
EV = (0,14 × 8,50) - 1 = +19%
Kelly ¼: ~0,6% banca → stake 0,25% aplicado
```

---

## Liquidação

| Final | Resultado |
|-------|-----------|
| 2-0 | **GREEN** |
| 3-0, 2-1, 1-0 | **RED** |
| Adiado | **VOID** |

---

## Checklist

- [x] λ calibrados
- [x] P(2-0) > 1/odd
- [x] Stake ≤ 0,5%
- [x] Titulares ofensivos Atalanta confirmados
- [x] Verona sem artilheiro titular

---

## Referências

- [../markets/01-resultados.md](../markets/01-resultados.md) — Resultado Correto
- [../ai/probabilidades.md](../ai/probabilidades.md)
- [../ai/value-bet.md](../ai/value-bet.md)
