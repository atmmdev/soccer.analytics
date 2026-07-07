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

| Indicador | 1X2 | O/U | BTTS | Escanteios | Cartões | Scorer |
|-----------|-----|-----|------|------------|---------|--------|
| xG / xGA | ●●● | ●●● | ●● | ● | ○ | ●● |
| SOT | ●● | ●● | ● | ●● | ○ | ●● |
| Escanteios médios | ● | ● | ○ | ●●● | ○ | ○ |
| Cartões médios | ○ | ○ | ○ | ○ | ●●● | ○ |
| gols/90 | ○ | ○ | ○ | ○ | ○ | ●●● |
| H2H | ● | ● | ● | ● | ●● | ○ |
| Árbitro | ○ | ○ | ○ | ○ | ●●● | ○ |

●●● = essencial · ●● = importante · ● = útil · ○ = secundário

---

## Referências

- [checklist.md](./checklist.md)
- Statistics Engine: `apps/api/src/engines/statistics-engine/`
