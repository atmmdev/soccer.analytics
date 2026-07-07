# Exemplo — Bilhete Conservador

> **Perfil:** baixo risco · **Objetivo:** preservar bankroll com edge estatístico  
> **Stake sugerido:** 1–2% da banca · **Odd combinada alvo:** 1,40–1,80

---

## Composição do bilhete

| # | Jogo | Mercado | Seleção | Odd | EV est. | Score IA |
|---|------|---------|---------|-----|---------|----------|
| 1 | Manchester City vs Wolves | Dupla Chance | 1X | 1,18 | +4,2% | 82 |
| 2 | Inter vs Empoli | Over/Under | Under 3.5 | 1,35 | +3,8% | 79 |
| 3 | Porto vs Farense | Over/Under | Over 1.5 | 1,22 | +3,1% | 85 |

**Odd combinada:** 1,18 × 1,35 × 1,22 = **1,94**  
**Stake:** 2u · **Retorno potencial:** 3,88u · **Lucro:** 1,88u

---

## Por que foi escolhido

### Seleção 1 — City 1X @ 1,18

- City invicto em casa nos últimos 15 jogos de liga.
- xG casa médio: 2,4 · xGA: 0,7.
- Wolves sem artilheiro titular; xG fora 0,9.
- **Dupla Chance** cobre empate — adequado a perfil conservador vs 1X2 puro @ 1,25.

### Seleção 2 — Inter Under 3.5 @ 1,35

- Inter líder defensivo: xGA 0,85/jogo em casa.
- Empoli média 0,8 gols fora; 7/10 Under 3.5.
- Linha 3.5 (não 2.5) reduz variância — aceita placares 2-0, 2-1.

### Seleção 3 — Porto Over 1.5 @ 1,22

- Porto marca em 18/20 em casa.
- Farense cede 1,6 xGA fora na 2ª divisão.
- Over 1.5 precisa apenas 2+ gols no jogo — barreira baixa.

---

## Estatísticas que justificam

| Indicador | City-Wolves | Inter-Empoli | Porto-Farense |
|-----------|-------------|--------------|---------------|
| xG casa (10j) | 2,41 | 1,95 | 2,10 |
| xGA casa | 0,68 | 0,82 | 0,71 |
| xG fora adv. | 0,91 | 0,78 | — |
| Over 1.5 % | 85% | 72% | 90% |
| Under 3.5 % | — | 70% | — |

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| City relaxa com título decidido | 1X cobre empate |
| Inter gol sofrido cedo → abre jogo | Under 3.5 ainda aguenta 2-1, 3-0 |
| Porto faz 1-0 e administra | Over 1.5 já GREEN com 1 gol — **atenção:** precisa 2 gols; risco real |
| Correlação entre jogos | **Baixa** — ligas/países diferentes |

---

## Correlação entre mercados

- **Entre pernas:** independência geográfica e de horário → correlação **neutra**.
- **Dentro de cada jogo:** 1X não correlaciona fortemente com Under 3.5 no mesmo jogo (não estão no bilhete juntos).

---

## Score IA do bilhete

```
Média ponderada: (82 + 79 + 85) / 3 = 82
Penalidade correlação: 1,00 (sem correlação)
Score bilhete: 82 — Forte
```

---

## Valor esperado

```
EV_combinado ≈ (1,042 × 1,038 × 1,031) - 1 ≈ +11,4% teórico
```

Variância ainda existe — 3 pernas aumentam chance de RED vs simples.

---

## Liquidação possível

| Cenário | Resultado |
|---------|-----------|
| 3 GREEN | Bilhete GREEN — lucro 1,88u |
| 1 RED | Bilhete RED — perda 2u |
| Void em uma perna | Recalcula odd das restantes |

---

## Checklist executado

- [x] Escalações confirmadas
- [x] Sem lesões bloqueantes
- [x] EV > 3% em cada perna
- [x] Score IA ≥ 70 cada
- [x] Correlação validada

---

## Referências

- [../markets/01-resultados.md](../markets/01-resultados.md) — Dupla Chance
- [../markets/02-gols.md](../markets/02-gols.md) — Over/Under
- [../ai/value-bet.md](../ai/value-bet.md)
