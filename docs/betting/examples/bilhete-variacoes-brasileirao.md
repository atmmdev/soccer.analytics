# Exemplo — Variações Brasileirão (6 perfis de bilhete)

> **Fonte:** matriz operacional de rodada · **Competição:** Brasileirão Série A  
> **Stake:** 0,5–1,5% conforme perfil · **Uso:** template para Ticket Builder e IA

---

## Os 6 perfis de bilhete

| # | Perfil | Objetivo | Odd alvo | Stake |
|---|--------|----------|----------|-------|
| 01 | **Seguro** | 1X2 conservador (favorito ou empate) | 1,40 – 2,00 | 1,5% |
| 02 | **Médio** | Mix resultado + empate como hedge | 2,00 – 3,50 | 1% |
| 03 | **Equilibrado** | Resultado direto com risco moderado | 2,50 – 4,00 | 1% |
| 04 | **Variação** | Alternar mandante/visitante vs favorito | 3,00 – 5,00 | 0,75% |
| 05 | **Agressivo** | Placar exato ou resultado estreito | 6,00 – 15,00 | 0,25–0,5% |
| 06 | **Proteção** | DC, empate ou under implícito | 1,50 – 2,20 | 1–1,5% |

---

## Rodada exemplo — 1X2 (10 jogos)

Matriz de seleções por perfil (modelo de preenchimento):

| # | Confronto | B01 Seguro | B02 Médio | B03 Equilibrado | B04 Variação | B05 Agressivo | B06 Proteção |
|---|-----------|------------|-----------|-----------------|--------------|---------------|--------------|
| 1 | Bahia × Santos | Bahia | Empate | Bahia | Santos | Bahia | Bahia |
| 2 | Botafogo × Internacional | Empate | Botafogo | Botafogo | Empate | Internacional | Botafogo |
| 3 | Remo × Cruzeiro | Cruzeiro | Empate | Cruzeiro | Remo | Cruzeiro | Cruzeiro |
| 4 | São Paulo × Mirassol | Empate | São Paulo | São Paulo | Mirassol | São Paulo | São Paulo |
| 5 | Corinthians × Vasco | Empate | Corinthians | Vasco | Empate | Corinthians | Corinthians |
| 6 | Grêmio × Coritiba | Grêmio | Empate | Grêmio | Coritiba | Grêmio | Grêmio |
| 7 | Athletico × Vitória | Athletico | Empate | Athletico | Vitória | Athletico | Athletico |
| 8 | Bragantino × Palmeiras | Empate | Palmeiras | Bragantino | Empate | Palmeiras | Palmeiras |
| 9 | Atlético-MG × Flamengo | Empate | Flamengo | Atlético-MG | Empate | Flamengo | Flamengo |
| 10 | Fluminense × Chapecoense | Fluminense | Empate | Fluminense | Chapecoense | Fluminense | Fluminense |

**Como ler:** B05 tende a zebra ou empate; B06 inclina ao favorito ou mandante forte; B02 usa empate como hedge frequente.

---

## Subconjunto — Placares exatos (4 jogos)

Para perfis **05 Agressivo** e análise Poisson:

| Confronto | B02 | B03 | B04 | B05 | B06 |
|-----------|-----|-----|-----|-----|-----|
| Atlético-MG × Flamengo | 1×1 | 2×2 | 2×1 | 1×3 | 0×2 |
| Corinthians × Vasco | 2×1 | 1×1 | 0×1 | 2×2 | 2×0 |
| Fluminense × Chapecoense | 3×0 | 2×1 | 1×0 | 3×1 | 0×2 |
| Bragantino × Palmeiras | 1×1 | 2×2 | 2×1 | 0×2 | 1×3 |

Formato `C×F` = gols casa × gols fora. Validar P(placar) na matriz antes de apostar ([probabilidades.md](../ai/probabilidades.md)).

---

## Análise por perfil

### B01 Seguro

- Foco: mandante forte ou favorito claro.
- Mercados: 1X2, DC, Over 1.5 ([ligas.md](../ai/ligas.md) — Brasileirão: SOT, cantos).
- Gate: ≥ 5/7 em [marcado-de-atuacao.md](../ai/marcado-de-atuacao.md).

### B05 Agressivo

- Placares exatos ou combinações odd 6+.
- **Expectativa:** hit rate baixo (~10–15% por placar) — stake mínimo.
- Obrigatório: EV por célula Poisson > 0.

### B06 Proteção

- Dupla chance, empate no bilhete múltiplo, ou favorito + under implícito.
- Menor odd, maior taxa de acerto esperada.

---

## Correlação entre pernas

| Risco | Mitigação |
|-------|-----------|
| 10 pernas 1X2 na mesma rodada | Não é uma múltipla — são **10 simples** independentes |
| Múltipla com 3+ jogos BR | Máx. 2 pernas ++ correlacionadas ([correlacoes.md](../ai/correlacoes.md)) |
| Placar + BTTS + Over | Calcular P conjunta |

---

## Checklist da rodada

- [ ] Gate 4/7 por jogo selecionado
- [ ] Escalações oficiais (Brasileirão: confirmar 1h antes)
- [ ] Stake total rodada ≤ 10% banca
- [ ] Registrar resultado real para backtest (coluna Resultado na planilha)

---

## Referências

- [bilhete-placares.md](./bilhete-placares.md) — método Poisson placar exato
- [bilhete-conservador.md](./bilhete-conservador.md) — perfil B01
- [01-resultados.md](../markets/01-resultados.md)
- [ligas.md](../ai/ligas.md) — Brasileirão Série A
