# 03 — Escanteios

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 03  
> **Liquidação padrão:** 90 minutos + acréscimos  
> **Engine:** Analysis Engine (Poisson O/U)

## Visão geral

Mercados sobre **cantos (corner kicks)** — totais, por time, intervalo, handicap e linhas asiáticas. Escanteios correlacionam com **posse**, cruzamentos, bloqueios e pressão ofensiva. No Soccer Analytics, `λ_corners = avgCorners_casa + avgCorners_fora` alimenta `probabilityOverLine()`.

**Odds operacionais:** Over 8.5/9.5 → 1,75–1,95 ([marcado-de-atuacao.md](../ai/marcado-de-atuacao.md)).

### Mercados neste arquivo

| # | Mercado | Dificuldade |
|---|---------|-------------|
| 1 | Total Escanteios | Médio |
| 2 | Escanteios Alternativos | Médio |
| 3 | Escanteios Por Time | Médio |
| 4 | Primeiro Escanteio | Alto |
| 5 | Último Escanteio | Alto |
| 6 | Escanteios Asiáticos | Médio |
| 7 | Handicap Escanteios | Médio |
| 8 | Escanteios Por Tempo | Alto |
| 9 | Escanteios Intervalo | Alto |
| 10 | Escanteios Exatos | Muito Alto |
| 11 | Primeiro a X Escanteios | Alto |

### Modelo Soccer Analytics

```
λ = max(1, home.avgCorners + away.avgCorners)
P(Over L) = 1 - Σ Poisson(λ,k) para k ≤ floor(L)
```

Importado via `MatchStatistics.homeCorners` / `awayCorners`.

---

# Total Escanteios

## O que é

Over/Under no **número total de escanteios** dos dois times no tempo regulamentar. Linha principal típica: **9.5**, **10.5**, **11.5** (varia por liga).

## Como funciona

- Escanteio concedido quando bola sai pela linha de fundo após toque de defensor (último toque).
- **Não** confundir com lateral ou tiro de meta.
- Poisson com λ = soma das médias históricas ajustada por estilo (posse, cruzamentos).

## Como a Bet365 contabiliza

| Conta | Não conta |
|-------|-----------|
| Escanteio **cobrado** | Escanteio concedido mas não cobrado (raro) |
| Cantos repetidos (short corner) | — |
| Acréscimos 1T e 2T | Prorrogação |

**GREEN Over 10.5:** 11+ escanteios · **RED:** ≤ 10

## Exemplo GREEN

**Man City vs Burnley** · 7+4 = **11 cantos** · **Over 10.5** @ 1,88 → **GREEN**

## Exemplo RED

**9 cantos** totais · Over 10.5 → **RED**

## Exemplo VOID

Partida abandonada → **VOID**

## Mercados relacionados

- Escanteios Por Time
- Handicap Escanteios
- Total Chutes / Bloqueados
- Over gols (correlação +)

## Quando utilizar

- Favorito em casa vs bloco baixo (monólogo → cantos)
- Média combinada > linha + 1,0 nos últimos 10
- EV+ no Analysis Engine com λ calibrado

## Quando evitar

- Jogo Under 1.5 gols esperado com dois times fechados
- Chuva extrema (menos cruzamentos)
- Time já classificado sem pressão

## Indicadores importantes

| Indicador | Peso |
|-----------|------|
| Escanteios/jogo (10j) | Alto |
| Posse % | Médio |
| Cruzamentos | Alto |
| Chutes bloqueados | Médio |
| xG (pressão) | Médio |
| Estilo (asas vs meio) | Médio |

## Perfil ideal

- PL, Bundesliga — alto volume de cantos
- Favorito vs defesa reativa

## Perfil ruim

- Serie A fechada 0-0
- Amistoso

## Riscos

- VAR / tempo parado reduz ritmo 2T
- Líder recua e adversário para de atacar

## Odds médias

| Linha | Over |
|-------|------|
| 9.5 | 1,85 – 2,00 |
| 10.5 | 1,88 – 2,05 |
| 11.5 | 1,90 – 2,08 |

## Grau de dificuldade

**Médio**

## Checklist

- [ ] λ_corners calculado (Statistics Engine)
- [ ] Comparar P(Over) vs odd
- [ ] EV > 5%
- [ ] Evitar duplicar Over gols + Over cantos sem edge conjunto

---

# Escanteios Alternativos

## O que é

Linhas **alternativas** de Over/Under (ex.: 8.5, 12.5, 13.5) além da linha principal — permite ajustar risco/retorno.

## Como funciona

Mesma liquidação que Total Escanteios; apenas a linha numérica muda. Over 8.5 = barreira baixa; Over 12.5 = agressivo.

## Como a Bet365 contabiliza

Idêntico ao Total Escanteios.

## Exemplo GREEN

**Over 12.5** · 14 cantos → **GREEN** @ 2,40

## Exemplo RED

**12 cantos** · Over 12.5 → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Total Escanteios (linha principal)
- Escanteios Asiáticos

## Quando utilizar

- Modelo indica 12 cantos esperados mas linha principal 10.5 com odd baixa → usar Over 12.5
- Under alternativo em jogo fechado (Under 8.5)

## Quando evitar

- Linhas extremas sem histórico (Over 15.5)

## Indicadores importantes

- Distribuição completa (não só média)
- Desvio padrão cantos/jogo

## Perfil ideal

- Analista que calibra λ e busca odd em linha secundária

## Perfil ruim

- Chute no escuro em linha alta

## Riscos

- Maior variância em linhas extremas

## Odds médias

8.5 Over: 1,50 – 1,70 · 12.5 Over: 2,20 – 2,60

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Fair odd calculada para linha específica
- [ ] Não confundir com linha principal da mesma casa

---

# Escanteios Por Time

## O que é

Over/Under de escanteios **de um time only** (ex.: Arsenal Over 6.5 cantos).

## Como funciona

Apenas cantos **a favor** do time selecionado. Adversário pode ter linha separada.

## Como a Bet365 contabiliza

Cantos conquistados pelo time, incluindo quando adversário toca por último na saída de bola.

## Exemplo GREEN

**Liverpool Over 7.5** · Liverpool **9** cantos → **GREEN**

## Exemplo RED

Liverpool **6** → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Total Escanteios
- Handicap Escanteios
- Posse / Chutes time

## Quando utilizar

- Mandante dominante monopoliza cantos
- Visitante joga no contra e cede cantos sem ter muitos

## Quando evitar

- Jogo equilibrado com posse 50-50

## Indicadores importantes

- Cantos casa/fora split
- Oponente cantos conceded

## Perfil ideal

- Casa top-4 vs bloco

## Perfil ruim

- Fora com posse

## Riscos

- 2T defensivo reduz cantos favorito

## Odds médias

1,85 – 2,05

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Split ≥ 10 jogos
- [ ] Estilo cruzamento confirmado

---

# Primeiro Escanteio

## O que é

Aposta em **qual time cobra o primeiro escanteio** da partida (ou "nenhum" em mercados raros).

## Como funciona

- Vence quem **cobrar** o primeiro corner.
- Ritmo inicial e pressão definem edge.

## Como a Bet365 contabiliza

Primeiro escanteio **executado** (não apenas concedido). Se jogo termina 0 cantos → regras específicas (VOID/RED).

## Exemplo GREEN

Aposta **Casa primeiro canto** · Min 3' canto casa → **GREEN** @ 1,75

## Exemplo RED

Visitante cobra primeiro → **RED**

## Exemplo VOID

0 escanteios no jogo (raro) → ver regras

## Mercados relacionados

- Último Escanteio
- Primeiro a X Escanteios
- Resultado 1T

## Quando utilizar

- Casa historically pressiona nos primeiros 15'
- Adversário cede cantos cedo

## Quando evitar

- Jogo cauteloso mata-mata

## Indicadores importantes

- % primeiro canto casa (10j)
- Cantos 0-15'

## Perfil ideal

- Mandante forte início

## Perfil ruim

- Jogo fechado

## Riscos

- Gol cedo muda dinâmica

## Odds médias

1,70 – 2,10 (dupla via)

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Histórico início de jogo
- [ ] Stake reduzido

---

# Último Escanteio

## O que é

Qual time cobra o **último escanteio** do tempo regulamentar.

## Como funciona

Similar ao primeiro; sensível a final de jogo (time perdendo pressiona).

## Como a Bet365 contabiliza

Último canto **cobrado** antes do apito final (+ acréscimos).

## Exemplo GREEN

**Visitante último canto** · 90+4' canto visitante → **GREEN**

## Exemplo RED

Casa cobra último → **RED**

## Exemplo VOID

0 cantos → regras casa

## Mercados relacionados

- Primeiro Escanteio
- Escanteios 2T

## Quando utilizar

- Time habitualmente pressiona no final
- Adversário abre placar e sofre reação

## Quando evitar

- Jogo decidido cedo

## Indicadores importantes

- Cantos 75-90+'
- Substituições ofensivas

## Perfil ideal

- Favorito perdendo

## Perfil ruim

- Controle total 3-0

## Riscos

- Árbitro encerra sem canto final

## Odds médias

1,75 – 2,15

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Padrão 2T documentado

---

# Escanteios Asiáticos

## O que é

Total de escanteios com **linhas asiáticas** (.25 / .75) — meio green, meio red ou push.

## Como funciona

| Linha | 10 cantos | 11 cantos |
|-------|-----------|-----------|
| Over 10.25 | Meio RED | Meio GREEN + push |
| Over 10.5 | RED | GREEN |
| Over 10.75 | RED | Meio GREEN |

Metade da stake em duas linhas adjacentes.

## Como a Bet365 contabiliza

Divisão de stake conforme tabela asiática padrão.

## Exemplo GREEN

**Over 10.5 asiático** · 11 cantos → **GREEN** integral

## Exemplo RED

10 cantos · Over 10.5 → **RED**

## Exemplo VOID / PUSH

Linha inteira 10.0 · exatamente 10 → push metade

## Mercados relacionados

- Total Escanteios
- [09-mercados-asiaticos.md](./09-mercados-asiaticos.md)

## Quando utilizar

- Quer reduzir variância vs linha .5 pura
- Modelo projeta ~10,8 cantos → linha 10.25

## Quando evitar

- Sem entender meio green/red

## Indicadores importantes

- λ com decimal próximo à linha

## Perfil ideal

- Apostador avançado

## Perfil ruim

- Iniciante

## Riscos

- Confusão na liquidação

## Odds médias

1,90 – 2,00 (linhas .25)

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Entender split de stake
- [ ] Comparar com linha europeia equivalente

---

# Handicap Escanteios

## O que é

Handicap aplicado ao **número de escanteios** de cada time (ex.: Casa -2.5 cantos).

## Como funciona

```
Casa -2.5: cantos_casa - 2.5 > cantos_fora → GREEN
```

Pode ser asiático ou europeu conforme mercado.

## Como a Bet365 contabiliza

Diferença de cantos após handicap. Empate após handicap em linha europeia = RED terceira via.

## Exemplo GREEN

**Casa -1.5** · Casa 8, Fora 5 → 8-1.5=6.5 > 5 → **GREEN**

## Exemplo RED

Casa 6, Fora 5 → 4.5 < 5 → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Escanteios Por Time
- Handicap Asiático (gols)

## Quando utilizar

- Dominância clara de cantos esperada
- Favorito vs bloco

## Quando evitar

- Jogo equilibrado

## Indicadores importantes

- Diferença média cantos
- Posse

## Perfil ideal

- City/Liverpool em casa

## Perfil ruim

- Derby equilibrado

## Riscos

- Visitante recua com cantos no 2T

## Odds médias

1,85 – 2,10

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Média diferença cantos ≥ 10 jogos
- [ ] EV calculado na diferença, não no total

---

# Escanteios Por Tempo

## O que é

Over/Under de escanteios no **1º tempo** ou **2º tempo** separadamente.

## Como funciona

- **1T:** do kick-off ao apito do intervalo (+ acréscimo 1T).
- **2T:** reinício ao apito final.

## Como a Bet365 contabiliza

Cantos atribuídos ao período em que foram **cobrados**.

## Exemplo GREEN

**Over 5.5 cantos 1T** · 7 no intervalo → **GREEN**

## Exemplo RED

5 no 1T → **RED**

## Exemplo VOID

Abandono no 1T → regras Bet365

## Mercados relacionados

- Escanteios Intervalo
- Gols por tempo

## Quando utilizar

- Histórico 65% cantos no 2T (time ajusta no intervalo)

## Quando evitar

- Primeiro jogo técnico novo

## Indicadores importantes

- Split cantos 1T/2T

## Perfil ideal

- Times pressão alta início ou fim

## Perfil ruim

- Sem padrão temporal

## Riscos

- Mudança tática HT

## Odds médias

1,85 – 2,05

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Amostra split ≥ 15 jogos

---

# Escanteios Intervalo

## O que é

Total de escanteios **somente no 1º tempo** (mercado explícito "Intervalo" ou HT).

## Como funciona

Equivalente a Escanteios Por Tempo (1T) — nomenclatura Bet365 pode variar.

## Como a Bet365 contabiliza

Até apito do intervalo inclusive acréscimos do 1T.

## Exemplo GREEN

**Over 4.5 HT** · 6 cantos 1T → **GREEN**

## Exemplo RED

4 cantos → **RED**

## Exemplo VOID

Abandono antes HT → VOID

## Mercados relacionados

- Escanteios Por Tempo
- Resultado Intervalo

## Quando utilizar

- Times começam forte
- Derby intenso início

## Quando evitar

- Jogos mornos 0-0 HT habituais

## Indicadores importantes

- Cantos médios 1T
- xG 1T

## Perfil ideal

- Pressing alto inicial

## Perfil ruim

- Catenaccio

## Riscos

- Árbitro apita cedo demais

## Odds médias

1,80 – 2,00

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Confirmar definição HT na Bet365

---

# Escanteios Exatos

## O que é

Aposta no **número exato** total de escanteios (ex.: exatamente 10) ou faixa estreita.

## Como funciona

Alta variância; odds altas. P(exato) via Poisson: `P(k=10) = Poisson(λ,10)`.

## Como a Bet365 contabiliza

Total exato no TR. Qualquer outro número = RED.

## Exemplo GREEN

**Exatamente 10 cantos** · Final 10 → **GREEN** @ 8,00

## Exemplo RED

9 ou 11 cantos → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Total Over/Under
- Faixa de gols (analogia)

## Quando utilizar

- λ muito estável (σ baixo)
- Odd value em cauda Poisson

## Quando evitar

- Quase sempre — entretenimento + stake mínimo

## Indicadores importantes

- Desvio padrão histórico baixo

## Perfil ideal

- Modelo calibrado + stake 0,25%

## Perfil ruim

- Palpite sem dados

## Riscos

- Variância extrema

## Odds médias

6,00 – 15,00+

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Stake ≤ 0,25% banca
- [ ] P(exato) > 1/odd

---

# Primeiro a X Escanteios

## O que é

Qual time atinge **primeiro** a marca de X escanteios (ex.: **primeiro a 5 cantos**).

## Como funciona

- Race market: primeiro a 5, 7, etc.
- Se ninguém atinge X → regras específicas (VOID ou RED todos).

## Como a Bet365 contabiliza

Time que **cobrar** o X-ésimo escanteio primeiro vence.

## Exemplo GREEN

**Casa primeiro a 7** · Casa chega a 7 antes → **GREEN** @ 1,90

## Exemplo RED

Visitante chega a 7 primeiro → **RED**

## Exemplo VOID

Jogo termina com ambos < 7 → ver regras

## Mercados relacionados

- Primeiro Escanteio
- Handicap Cantos
- Escanteios Por Time

## Quando utilizar

- Dominância esperada clara
- Favorito monopoliza cantos

## Quando evitar

- Jogo fechado com total Under cantos

## Indicadores importantes

- Velocidade acumulação cantos
- Média total vs X

## Perfil ideal

- Favorito -1.5 cantos implícito

## Perfil ruim

- Total Under 9.5 esperado

## Riscos

- Adversário para de atacar após placar

## Odds médias

1,75 – 2,20

## Grau de dificuldade

**Alto**

## Checklist

- [ ] X < média total esperada
- [ ] Dominância histórica confirmada

---

## Matriz de correlação

|  | Over gols | Chutes | Posse | Cartões |
|--|-----------|--------|-------|---------|
| Over cantos | + | ++ | + | + fraco |
| Cantos time | + | ++ | ++ | — |

---

## Referências

- Analysis Engine: `probabilityOverLine()` · `apps/api/src/engines/analysis-engine/`
- [05-chutes.md](./05-chutes.md) · [09-mercados-asiaticos.md](./09-mercados-asiaticos.md)
- [../ai/correlacoes.md](../ai/correlacoes.md)
