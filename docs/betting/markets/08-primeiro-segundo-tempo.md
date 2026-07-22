# 08 — Primeiro e Segundo Tempo

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 08  
> **Liquidação:** período específico (1T, 2T ou comparação)  
> **Engine:** Analysis Engine (Poisson com fator temporal)

## Visão geral

Mercados recortados por **período da partida**. O tempo regulamentar divide-se em 1º tempo (45 min + acréscimo 1T) e 2º tempo (45 min + acréscimo 2T). Modelagem usa **λ_HT ≈ λ_total × 0,43–0,46** e **λ_2T ≈ λ_total × 0,54–0,57** (ajustável por time).

**Odds operacionais:** Over 0.5 HT 1,35–1,55 · combo HT+FT 1,90–2,20 — ver [marcado-de-atuacao.md](../ai/marcado-de-atuacao.md) e [strategy/live.md](../strategy/live.md).

### Mercados neste arquivo

| # | Mercado | Dificuldade |
|---|---------|-------------|
| 1 | Resultado 1º Tempo | Médio |
| 2 | Resultado 2º Tempo | Médio |
| 3 | Gols 1º Tempo Over/Under | Médio |
| 4 | Gols 2º Tempo Over/Under | Médio |
| 5 | BTTS 1º Tempo | Alto |
| 6 | BTTS 2º Tempo | Alto |
| 7 | Mais Gols em Qual Período | Médio |
| 8 | Time Marca em Ambos os Tempos | Alto |
| 9 | Gols Exatos 1º Tempo | Muito Alto |
| 10 | Vencer Ambos os Tempos | Muito Alto |

### Modelo Soccer Analytics

```
λ_HT = λ_total × f_HT    (f_HT default 0,45)
λ_2T = λ_total × (1 - f_HT)
P(Over 0.5 HT) = 1 - Poisson(λ_HT, 0)
Matriz Poisson reduzida → 1X2 intervalo
```

**Status:** parcialmente modelado; fator temporal calibrável por liga/time.

---

# Resultado 1º Tempo

## O que é

Aposta **1X2** considerando **apenas o placar ao intervalo** (fim do 1º tempo + acréscimos do 1T).

## Como funciona

- **1:** casa lidera no intervalo.
- **X:** empate no intervalo.
- **2:** fora lidera no intervalo.
- Gols do 2T **irrelevantes**.

## Como a Bet365 contabiliza

| Situação | Liquidação |
|----------|------------|
| HT 1-0, aposta **1** | **GREEN** |
| HT 0-0, aposta **1** | **RED** |
| HT 1-1, aposta **X** | **GREEN** |
| Gol anulado VAR antes intervalo | Placar após decisão final |
| Abandono antes HT | Regras Bet365 (VOID comum) |

## Exemplo GREEN

**Real Madrid vs Barcelona** · HT **2-1** · Aposta **1** @ 2,40 → **GREEN**

## Exemplo RED

HT **0-0** · Aposta **1** → **RED**

## Exemplo VOID

Partida abandonada 30' sem retorno → **VOID**

## Mercados relacionados

- Resultado Final
- Intervalo/Final
- Gols 1T Over/Under
- [01-resultados.md](./01-resultados.md)

## Quando utilizar

- Time forte início (≥ 55% lidera HT em casa)
- Adversário começa lento fora
- λ_HT favorável com edge vs odd

## Quando evitar

- Times equilibrados sem padrão HT
- Primeiro jogo técnico novo

## Indicadores importantes

- % vitórias/empates HT (10j)
- xG 1T (se disponível)
- Gols 0-15' e 15-30'
- Histórico H2H HT

## Perfil ideal

- Casa pressiona alto (Liverpool, Bayern)

## Perfil ruim

- Jogo mata-mata cauteloso 0-0 HT

## Riscos

- Gol HT muda tudo; variância maior que FT em amostras pequenas

## Odds médias

| Seleção | Faixa |
|---------|-------|
| Favorito HT | 1,90 – 2,60 |
| Empate HT | 2,20 – 2,80 |
| Zebra HT | 4,00 – 8,00 |

## Grau de dificuldade

**Médio**

## Checklist

- [ ] f_HT calibrado por time
- [ ] P(1X2 HT) vs odds
- [ ] EV > 5%

---

# Resultado 2º Tempo

## O que é

Aposta **1X2** considerando **apenas gols marcados no 2º tempo** (inclui acréscimos 2T).

## Como funciona

- Placar "virtual" 2T = gols FT − gols HT.
- Ex.: FT 2-1, HT 1-0 → 2T = **1-1** (empate no 2T).
- Três vias: quem "venceu" o 2T.

## Como a Bet365 contabiliza

Calcula diferença de gols entre intervalo e final. Empate no 2T (ex.: 1-1 no 2T) = **X**.

## Exemplo GREEN

FT 1-0 HT, FT 3-1 → 2T **2-1** · Aposta **1** (casa vence 2T) → **GREEN**

## Exemplo RED

FT 1-0 HT, FT 1-0 → 2T **0-0** · Aposta **1** → **RED**

## Exemplo VOID

Abandono no 2T → regras

## Mercados relacionados

- Resultado 1T
- Gols 2T Over/Under
- Mais Gols em Qual Período

## Quando utilizar

- Time famoso por reação 2T
- Adversário cede gols após intervalo
- Substitutos ofensivos impactantes

## Quando evitar

- Líder administra 2T sem marcar

## Indicadores importantes

- Gols marcados/sofridos 2T
- Substituições habituais 60'
- xG 2T estimado

## Perfil ideal

- Time com banco forte

## Perfil ruim

- Líder 2-0 HT recua

## Riscos

- Interpretação confusa para apostadores

## Odds médias

1,90 – 3,00

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Separar stats 2T dos últimos 10 jogos

---

# Gols 1º Tempo Over/Under

## O que é

Over/Under de **total de gols no 1º tempo** (ex.: Over 0.5, Over 1.5 HT).

## Como funciona

```
λ_HT = λ_total × f_HT
P(Over 0.5 HT) = 1 - e^(-λ_HT)
P(Over 1.5 HT) = 1 - P(0) - P(1) via Poisson
```

Linhas comuns: **0.5**, **1.5**, **2.5** gols HT.

## Como a Bet365 contabiliza

Gols até apito do intervalo (+ acréscimo 1T). Gols anulados VAR não contam.

## Exemplo GREEN

**Over 1.5 HT** · HT **2-0** (2 gols) → **GREEN** @ 2,10

## Exemplo RED

HT **1-0** (1 gol) · Over 1.5 → **RED**

## Exemplo VOID

Abandono 1T → **VOID**

## Mercados relacionados

- Over 2.5 FT
- BTTS 1T
- Resultado 1T

## Quando utilizar

- λ_HT > 1,2 (jogos abertos)
- Times que marcam cedo
- Over 0.5 HT com odd value (barreira baixa)

## Quando evitar

- Catenaccio 0-0 HT habitual

## Indicadores importantes

- % Over 0.5 HT / Over 1.5 HT
- xG 1T
- Ritmo inicial

## Perfil ideal

- Bundesliga, PL abertas

## Perfil ruim

- Serie A fechada

## Riscos

- Gol único decide Over 0.5 vs Under 1.5

## Odds médias

| Linha | Over |
|-------|------|
| 0.5 HT | 1,35 – 1,50 |
| 1.5 HT | 2,00 – 2,40 |

## Grau de dificuldade

**Médio**

## Checklist

- [ ] λ_HT calculado
- [ ] Comparar com linha Bet365

---

# Gols 2º Tempo Over/Under

## O que é

Over/Under de gols **somente no 2º tempo**.

## Como funciona

λ_2T = λ_total − λ_HT (ou fator 0,55). Mesma lógica Poisson.

## Como a Bet365 contabiliza

Gols após reinício até apito final (+ acréscimo 2T).

## Exemplo GREEN

HT 0-0, FT 2-1 → **3 gols 2T** · Over 1.5 2T → **GREEN**

## Exemplo RED

HT 1-0, FT 1-0 → 0 gols 2T · Over 0.5 → **RED**

## Exemplo VOID

Abandono início 2T → regras

## Mercados relacionados

- Gols 1T O/U
- Mais Gols Qual Período
- Over 2.5 FT

## Quando utilizar

- Times reagem 2T (perdendo HT)
- Substitutos decisivos
- λ_2T > 1,3

## Quando evitar

- Líder fecha jogo 2T

## Indicadores importantes

- Gols 2T/jogo
- xG 2T
- Padrão substituições

## Perfil ideal

- Favorito perdendo HT

## Perfil ruim

- 3-0 HT administração

## Riscos

- Depende de dinâmica HT

## Odds médias

Over 0.5 2T: 1,25 – 1,40 · Over 1.5 2T: 1,85 – 2,15

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Stats 2T separadas

---

# BTTS 1º Tempo

## O que é

**Ambas marcam no 1º tempo** — Sim/Não.

## Como funciona

- **Sim:** ambos ≥ 1 gol no 1T.
- **Não:** pelo menos um sem gol no 1T.

## Como a Bet365 contabiliza

HT 1-1 → **Sim** GREEN · HT 1-0 → **Não** GREEN

## Exemplo GREEN

**BTTS Sim 1T** · HT 1-1 → **GREEN** @ 3,50

## Exemplo RED

HT 2-0 → **RED**

## Exemplo VOID

Abandono 1T → **VOID**

## Mercados relacionados

- BTTS FT
- BTTS 2T
- Over 1.5 HT

## Quando utilizar

- Jogos abertos desde início
- H2H BTTS HT frequente

## Quando evitar

- Jogos fechados 0-0 HT

## Indicadores importantes

- % BTTS 1T
- xG ambos 1T

## Perfil ideal

- Derby ofensivo

## Perfil ruim

- Final defensiva

## Riscos

- Alta variância; odd Sim alta

## Odds médias

Sim: 3,00 – 5,00 · Não: 1,15 – 1,25

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Frequência BTTS 1T > implícita

---

# BTTS 2º Tempo

## O que é

Ambas marcam **no 2º tempo** apenas.

## Como funciona

HT 0-0, FT 1-1 → ambos marcaram 2T → **Sim** GREEN.

## Como a Bet365 contabiliza

Gols 2T de cada time ≥ 1.

## Exemplo GREEN

HT 0-0, FT 2-1 → casa 2T, fora 1T → **Sim** GREEN

## Exemplo RED

HT 1-0, FT 2-0 → fora não marcou 2T → **Não** GREEN (se apostou Sim → RED)

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- BTTS 1T · BTTS FT

## Quando utilizar

- 0-0 HT habitual + gols 2T

## Quando evitar

- Líder administra

## Indicadores importantes

- BTTS 2T %
- Padrão 0-0 HT → gols 2T

## Perfil ideal

- Jogos "segundo tempo show"

## Perfil ruim

- Controle total favorito

## Riscos

- Interpretação placar 2T

## Odds médias

Sim: 2,50 – 4,00

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Histórico 0-0 HT + BTTS 2T

---

# Mais Gols em Qual Período

## O que é

Aposta em qual período terá **mais gols**: **1º tempo**, **2º tempo** ou **empate** (mesmo número).

## Como funciona

- Conta gols HT vs gols 2T.
- Empate: ex. HT 1-0, FT 2-1 → 1 gol cada → **Empate**.

## Como a Bet365 contabiliza

Compara totais; três vias.

## Exemplo GREEN

HT 0-0, FT 3-0 → 0 HT, 3 2T → Aposta **2º tempo** → **GREEN**

## Exemplo RED

HT 2-0, FT 2-1 → 2 HT, 1 2T → Aposta **2T** → **RED**

## Exemplo VOID

0-0 total → **Empate** GREEN se apostou empate

## Mercados relacionados

- Gols 1T/2T O/U
- Resultado intervalo

## Quando utilizar

- Padrão claro (65% gols 2T)
- Times ajustam no intervalo

## Quando evitar

- Sem padrão temporal

## Indicadores importantes

- % gols 1T vs 2T liga/time
- f_HT calibrado

## Perfil ideal

- Times "second half teams"

## Perfil ruim

- Distribuição 50-50

## Riscos

- Um gol muda período vencedor

## Odds médias

1T: 2,80 – 3,50 · 2T: 2,00 – 2,60 · Empate: 3,50 – 4,50

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Split gols 1T/2T ≥ 15 jogos

---

# Time Marca em Ambos os Tempos

## O que é

Aposta em **um time** marcar **≥ 1 gol no 1T** E **≥ 1 gol no 2T**.

## Como funciona

- Ex.: "Casa marca ambos tempos" — casa gol HT + casa gol 2T.
- FT 2-0 HT 1-0 → casa marcou 1T sim, 2T sim (1 gol 2T) → **GREEN**.

## Como a Bet365 contabiliza

Gols do time em cada período separadamente.

## Exemplo GREEN

**City marca ambos** · HT 1-0, FT 3-0 → **GREEN** @ 2,20

## Exemplo RED

HT 1-0, FT 1-0 → City não marcou 2T → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- BTTS FT
- Over gols time
- Vencer ambos tempos

## Quando utilizar

- Favorito dominante 90 min
- Média > 70% marca 1T e 2T

## Quando evitar

- Time marca cedo e administra

## Indicadores importantes

- % marca 1T e 2T
- xG por período

## Perfil ideal

- City, Bayern casa

## Perfil ruim

- 1-0 e fecha

## Riscos

- Correlação ++ com Over FT

## Odds médias

1,90 – 2,80

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Frequência ambos tempos > 1/odd

---

# Gols Exatos 1º Tempo

## O que é

Aposta no **número exato de gols no 1T** (0, 1, 2, 3+).

## Como funciona

Poisson com λ_HT: P(k gols) = Poisson(λ_HT, k).

## Como a Bet365 contabiliza

Total gols HT exato. 3+ agrupa 3 ou mais.

## Exemplo GREEN

**Exatamente 2 gols HT** · HT 1-1 → **GREEN** @ 4,50

## Exemplo RED

HT 1-0 → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Placar exato HT
- Gols O/U 1T

## Quando utilizar

- λ_HT estável, σ baixo
- Edge em cauda Poisson

## Quando evitar

- Stake mínimo apenas

## Indicadores importantes

- Distribuição gols HT

## Perfil ideal

- Modelo calibrado

## Perfil ruim

- Palpite

## Riscos

- Muito Alto variância

## Odds médias

3,50 – 8,00+

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Stake ≤ 0,25%

---

# Vencer Ambos os Tempos

## O que é

Time **vence o placar do 1T** (ex.: 1-0) **E vence o placar do 2T** (ex.: 2-0 no 2T).

## Como funciona

- Casa vence HT (1-0) + casa vence 2T (2-0 no 2T) = **GREEN**.
- FT 3-0 HT 1-0 → 2T 2-0 → **GREEN**.

## Como a Bet365 contabiliza

Compara placares parciais; time deve "ganhar" cada período.

## Exemplo GREEN

HT 2-0, FT 4-1 → 2T 2-1 casa → casa venceu 1T e 2T → **GREEN** @ 3,00

## Exemplo RED

HT 1-0, FT 1-1 → empate 2T → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Intervalo/Final Casa/Casa
- Vencer cada tempo

## Quando utilizar

- Dominância extrema esperada
- Favorito -2 handicap alinhado

## Quando evitar

- Qualquer jogo equilibrado

## Indicadores importantes

- % domínio 90 min
- xG diff

## Perfil ideal

- City vs lanterna

## Perfil ruim

- Derby

## Riscos

- Muito Alto

## Odds médias

2,50 – 5,00

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Stake mínimo
- [ ] Não correlacionar com -1.5 handicap sem cálculo

---

## Referências

- [01-resultados.md](./01-resultados.md) — Resultado Intervalo
- [02-gols.md](./02-gols.md) — Over/Under
- Analysis Engine — fator temporal (roadmap)
- [../ai/probabilidades.md](../ai/probabilidades.md)
