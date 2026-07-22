# Indicadores Estatísticos

> Catálogo de métricas para análise pré-jogo e modelos de IA

---

## 1. Expected Goals (xG)

| Atributo | Detalhe |
|----------|---------|
| **Definição** | Gols esperados com base na qualidade das chances |
| **Escala** | 0–1+ por chute; ~0–4 por time/jogo |
| **Fonte** | API-Football, FBref, modelo interno |
| **Uso** | Over/Under, 1X2, BTTS, λ Poisson |

**Interpretação:**

| xG total (jogo) | Perfil |
|-----------------|--------|
| < 1,8 | Defensivo |
| 1,8–2,6 | Médio |
| > 2,6 | Ofensivo / aberto |

---

## 2. Expected Goals Against (xGA)

Gols esperados **sofridos**. Mede qualidade defensiva (chances cedidas).

```
Força defensiva ∝ 1/xGA
```

---

## 3. xG por chute (xG/shot)

Eficiência ofensiva. Alto = chances claras; baixo = chutes de longe.

---

## 4. Expected Assists (xA)

Assistências esperadas. Props de jogador e criação de chances.

---

## 5. Expected Saves (xSV / PSxG)

Performance do goleiro vs qualidade dos chutes sofridos.

```
Goleiro acima da média: Gols_sofridos < xGA
```

---

## 6. Shots (Finalizações)

Volume ofensivo. Correlaciona com escanteios e Over gols.

| Média time (top liga) | ~10–14/jogo |
|-----------------------|-------------|

---

## 7. Shots on Target (SOT)

Chutes perigosos. Melhor preditor de gols que shots totais.

```
Taxa SOT = SOT / Shots  (típico 30–40%)
```

---

## 8. Escanteios

| Média | ~9–11 total/jogo (ligas top) |
|-------|------------------------------|

Indicadores: cruzamentos, bloqueios, pressão, estilo tático.

---

## 9. Cartões

| Média | ~3–5 amarelos/jogo |
|-------|-------------------|

Fatores: árbitro, derby, stakes, faltas.

---

## 10. Posse de bola (%)

Contexto tático — **não** preditor isolado de resultado.

| Posse alta + xG baixo | Posse estéril |
|-----------------------|---------------|

---

## 11. PPDA (Passes Per Defensive Action)

Pressing: **menor PPDA** = mais pressão.

---

## 12. Forma (últimos N jogos)

| Métrica | N recomendado |
|---------|---------------|
| Gols F/S | 10 |
| Casa/Fora | 10 cada |
| H2H | 5–10 |

Peso maior em jogos recentes (decaimento exponencial opcional).

---

## 13. Casa / Fora

Splits separados — mandante costuma ter +0,3 a +0,5 xG vs média.

---

## 14. Confronto direto (H2H)

Útil em rivalidades; amostra pequena — combinar com forma geral.

---

## 15. Minutos e gols/90 (jogador)

```
gols/90 = (gols / minutos) × 90
```

Base do Player Engine para anytime scorer.

---

## 16. Titularidade e rotação

| Status | Impacto |
|--------|---------|
| Titular confirmado | Props jogador válidos |
| Reserva / dúvida | VOID ou SKIP |
| Rotação UCL | -xG, -confiança favorito |

---

## 17. Lesões e suspensões

Ajustar λ_casa, λ_fora manualmente ou via delta xG:

| Ausência | Delta xG típico |
|----------|-----------------|
| Artilheiro titular | -0,15 a -0,25 |
| Zagueiro titular | +0,10 xGA |
| Goleiro titular | variável |

---

## 18. Descanso

| Dias | Efeito |
|------|--------|
| < 3 | Fadiga, -intensidade |
| 3–5 | Normal |
| > 6 | Descansado (se não ferrugem) |

---

## 19. Importância do jogo

| Contexto | Efeito |
|----------|--------|
| Mata-mata | +intensidade, +cartões |
| Última rodada safe | +rotação |
| Rebaixamento | +motivação zebra |

---

## 20. Árbitro

| Stat | Uso |
|------|-----|
| Média cartões/jogo | Mercados cartões |
| Pênaltis/jogo | Props raros |
| Acréscimos médios | Tempo |

---

## 21. Clima

| Condição | Efeito |
|----------|--------|
| Chuva | -gols, -precisão |
| Vento | -cruzamentos |
| Calor | -2º tempo |

---

## 22. Odds e movimento

| Sinal | Interpretação |
|-------|---------------|
| Odd caindo | Dinheiro no mercado |
| Odd subindo | Saída ou notícia |
| Steam move | Validar notícia |

---

## Tabela mestra — mercado × indicador

| Indicador | 1X2 | O/U | BTTS | Escanteios | Cartões | Scorer | Props jogador |
|-----------|-----|-----|------|------------|---------|--------|---------------|
| xG / xGA | ●●● | ●●● | ●● | ● | ○ | ●● | ● |
| SOT | ●● | ●● | ● | ●● | ○ | ●● | ●● |
| Escanteios médios | ● | ● | ○ | ●●● | ○ | ○ | ● (cabeçadas) |
| Cartões médios | ○ | ○ | ○ | ○ | ●●● | ○ | ● (faltas) |
| gols/90 | ○ | ○ | ○ | ○ | ○ | ●●● | ●● |
| Key passes / xA | ○ | ● | ○ | ○ | ○ | ● | ●●● |
| Duelos / recuperações | ○ | ○ | ○ | ○ | ● | ○ | ●●● |
| PPDA | ● | ● | ● | ● | ● | ○ | ●● |
| H2H | ● | ● | ● | ● | ●● | ○ | ○ |
| Árbitro | ○ | ○ | ○ | ○ | ●●● | ○ | ● |

●●● = essencial · ●● = importante · ● = útil · ○ = secundário

---

### Indicadores de props (complemento)

| Indicador | Definição resumida | Mercados |
|-----------|-------------------|----------|
| Key passes | Passes que geram finalização | Passes decisivos, xA, assistências |
| Aerials / cabeçadas | Disputas aéreas ou headed shots | Cabeçadas, duelos |
| Ball recoveries | Recuperações de posse | Recuperações, pressing |
| Duelos totais | 1×1 aéreos + terrestres | Duelos, desarmes |
| Goal kicks | Tiros de meta do goleiro | Tiros de meta, pressão sofrida |
| SCA / GCA | Ações que criam chute / gol | Criação, xA |

---

## Referências

- [checklist.md](./checklist.md)
- [glossary.md](../knowledge/glossary.md) — Yield, duelo, recuperação
- Statistics Engine: `apps/api/src/engines/statistics-engine/`
- Player props: [markets/06-estatisticas-jogador.md](../markets/06-estatisticas-jogador.md)
