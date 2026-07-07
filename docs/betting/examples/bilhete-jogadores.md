# Exemplo — Bilhete Jogadores

> **Perfil:** props de marcador · **Engine:** Player Engine  
> **Stake sugerido:** 1% da banca (combinada) ou 0,5% por simples

---

## Composição

| # | Jogo | Mercado | Seleção | Odd | EV | Score IA | Modelo |
|---|------|---------|---------|-----|-----|----------|--------|
| 1 | Bayern vs Augsburg | Anytime | Kane | 1,45 | +5,2% | 73 | ✅ |
| 2 | Milan vs Lecce | Anytime | Pulisic | 2,80 | +11% | 68 | ✅ |

**Odd combinada:** 1,45 × 2,80 = **4,06**  
**Stake combinada:** 1u · **Retorno:** 4,06u

---

## Por que foi escolhido

### Kane Anytime @ 1,45

| Métrica | Valor |
|---------|-------|
| gols/90 (10j) | 0,92 |
| Minutos médios | 87 |
| Titular | Confirmado |
| Augsburg xGA fora | 1,85 |
| λ_jogador (modelo) | 0,78 |
| P(marcar) | **72%** vs impl. 69% |

Player Engine: `hasModel: true`, `playerModel: true`

### Pulisic Anytime @ 2,80

| Métrica | Valor |
|---------|-------|
| gols/90 | 0,45 |
| Lecce xGA fora | 1,62 |
| P(marcar) | **40%** vs impl. 35,7% |
| Amostra | 9 jogos (limite) |

---

## Estatísticas que justificam

| Indicador | Kane | Pulisic |
|-----------|------|---------|
| gols/90 | 0,92 | 0,45 |
| starts/10 | 10 | 8 |
| xG time | 2,4 | 1,7 |
| xGA adversário | 1,85 | 1,62 |
| Pênaltis | Kane cobrador | Não |

---

## Riscos

| Risco | Kane | Pulisic |
|-------|------|---------|
| Substituição cedo | Baixo | Médio |
| Não titular | VOID | VOID |
| Adversário fecha | Baixo | Médio |
| Amostra pequena | — | **Alto** |
| Combinada 2 props | Variância ++ | — |

---

## Correlação

- **Entre pernas:** jogos diferentes (Alemanha × Itália) → **neutra**.
- **Não** combinar Kane anytime + Bayern Over 2.5 na mesma múltipla sem ajuste (++ correlação).

---

## Score IA

| Bilhete | Score |
|---------|-------|
| Kane isolado | 73 |
| Pulisic isolado | 68 |
| Combinada | 70 (média -2% variância props) |

---

## Valor esperado

```
EV Kane: +5,2%
EV Pulisic: +11%
EV combinada: (1,052 × 1,11) - 1 ≈ +16,8%
```

**Alternativa conservadora:** duas apostas **simples** de 0,5u cada.

---

## Liquidação Bet365

| Situação | Kane | Pulisic |
|----------|------|---------|
| Marca 1+ | GREEN | GREEN |
| 0 gols | RED | RED |
| Banco 90' | VOID | VOID |
| Gol contra | RED | RED |

---

## Checklist Player Engine

- [x] `MatchPlayerPerformance` importado
- [x] Lineups confirmados (`/fixtures/lineups`)
- [x] gols/90 calculados
- [x] EV > 5%
- [x] Regra "must start" verificada
- [ ] Pulisic: amostra limite — considerar WATCH se lesão

---

## Referências

- [../markets/07-marcadores.md](../markets/07-marcadores.md)
- [../markets/06-estatisticas-jogador.md](../markets/06-estatisticas-jogador.md)
- [../ai/indicadores.md](../ai/indicadores.md)
- Player Engine: `apps/api/src/engines/player-engine/`
