# 01 — Resultados

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 01
> **Liquidação padrão:** 90 minutos + acréscimos
> **Referência:** Bet365 (regras gerais)

## Visão geral

Mercados de **desfecho competitivo**: vitória, empate, placar exato, combinações e handicaps. Base da matriz Poisson no Analysis Engine.

### Mercados neste arquivo

| # | Mercado | Engine |
|---|---------|--------|
| 1 | Resultado Final | Analysis Engine |
| 2 | Resultado Intervalo | Analysis Engine |
| 3 | Resultado Correto | Analysis Engine |
| 4 | Resultado Correto Intervalo | Analysis Engine |
| 5 | Empate Anula | Analysis Engine |
| 6 | Chance Dupla | Analysis Engine |
| 7 | Intervalo/Final | Analysis Engine |
| 8 | Resultado+BTTS | Analysis Engine |
| 9 | Resultado+Over | Analysis Engine |
| 10 | Resultado+Under | Analysis Engine |
| 11 | Método da Vitória | Analysis Engine |
| 12 | Para Qualificar | Analysis Engine |
| 13 | Handicap Europeu | Analysis Engine |
| 14 | Handicap Alternativo | Analysis Engine |

### Integração Soccer Analytics

P(1), P(X), P(2) pela soma de células da matriz Poisson. Handicaps deslocam margens. Combinações usam probabilidade conjunta.

```
λ_casa, λ_fora → matriz Poisson → P(mercado)
Player Engine → P(jogador marca / stat ≥ linha)
```

### Tabela de liquidação rápida

| Termo | Significado |
|-------|-------------|
| GREEN | Aposta ganha |
| RED | Aposta perdida |
| VOID | Stake devolvido |
| PUSH | Linha exata (asiáticos) — devolução |

---

# Resultado Final

## O que é

Aposta no resultado ao fim do TR: **1** (casa), **X** (empate), **2** (fora).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Três vias mutuamente exclusivas.
Liquidação após apito final do 2º tempo.
```
P(Casa) = Σ P(i,j), i>j
P(Empate) = Σ P(i,i)
P(Fora) = Σ P(i,j), i<j
```
Fair odds via remoção de margem ([probabilidades.md](../ai/probabilidades.md)).

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

**Arsenal 2-1 Chelsea** · Aposta **1** @ 2,10 → **GREEN**

## Exemplo RED

**Arsenal 1-1 Chelsea** · Aposta **1** → **RED**

## Exemplo VOID

Partida adiada sem data em 48h → **VOID**

## Mercados relacionados

- Chance Dupla
- Empate Anula
- Handicap Europeu
- Resultado Intervalo

## Quando utilizar

- λ calibrado com edge > 3%
- Favorito com value no empate ou zebra

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com matriz Poisson e histórico H2H.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,20 – 8,00 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Médio** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Resultado Intervalo

## O que é

1X2 ao **intervalo** (45 min + acréscimos do 1º tempo).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

λ_HT ≈ 0,45 × λ_total (ajustar por time).
Gols do 2T irrelevantes.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

HT **1-0** · Aposta **1** @ 2,40 → GREEN

## Exemplo RED

HT **0-0** · Aposta **1** → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Intervalo/Final
- Gols 1º Tempo

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,50 – 5,00 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Médio** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Resultado Correto

## O que é

Placar exato final (ex.: 2-1, 0-0).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

P(2-1) = célula P(2,1) na matriz.
Qualquer outro placar = RED.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Aposta **2-1** @ 8,50 · Final 2-1 → GREEN

## Exemplo RED

Aposta **2-1** · Final 2-0 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- Distribuição placares
- λ baixo → 0-0, 1-0 mais prováveis

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 6,00 – 101,00 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Muito Alto** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Resultado Correto Intervalo

## O que é

Placar exato no intervalo.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

HT 1-0 apostado · HT 1-0 → GREEN

## Exemplo RED

HT 1-0 apostado · HT 1-1 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 5,00 – 51,00 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Muito Alto** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Empate Anula

## O que é

**DNB:** vitória do time apostado = GREEN; empate = VOID; derrota = RED.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Equivalente Asian Handicap 0.0.
P(DNB Casa) = P(Casa)/(P(Casa)+P(Fora))

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Casa vence 1-0 → GREEN

## Exemplo RED

0-1 → RED

## Exemplo VOID

1-1 → VOID

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Perfil conservador vs 1X2 puro.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,30 – 2,20 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Baixo** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Chance Dupla

## O que é

**1X**, **12** ou **X2** — duas de três vias cobertas.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

**1X** · 1-1 → GREEN

## Exemplo RED

**1X** · 0-1 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,10 – 1,80 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Baixo** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Intervalo/Final

## O que é

Combinação HT/FT (ex.: X/1 = empate HT, casa FT).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Correlação HT→FT modelada no Analysis Engine.
9 combinações principais.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

X/1 · HT 0-0, FT 2-1 → GREEN

## Exemplo RED

X/1 · FT 1-1 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 3,00 – 25,00 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Alto** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Resultado+BTTS

## O que é

Resultado + Ambas Marcam Sim/Não.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Casa + BTTS Sim · 3-1 → GREEN

## Exemplo RED

Casa + BTTS Sim · 2-0 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 2,50 – 12,00 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Alto** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Resultado+Over

## O que é

Resultado + Over linha (ex.: Casa + Over 2.5).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Casa + O2.5 · 3-1 → GREEN

## Exemplo RED

Casa + O2.5 · 2-0 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,80 – 3,50 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Alto** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Resultado+Under

## O que é

Resultado + Under linha.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

X + U2.5 · 1-1 → GREEN

## Exemplo RED

X + U2.5 · 2-2 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,80 – 3,50 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Alto** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Método da Vitória

## O que é

Vitória no TR, prorrogação ou pênaltis (eliminatórias).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Prorrogação e pênaltis contam só neste mercado em jogos de copa.

## Exemplo GREEN

Casa nos pênaltis → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,80 – 15,00 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Alto** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Para Qualificar

## O que é

Time que avança (ida/volta ou único).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Inclui prorrogação e pênaltis.
Gol fora pode aplicar.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Casa qualifica no agregado → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,40 – 3,50 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Médio** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Handicap Europeu

## O que é

Handicap inteiro no placar (ex.: Casa -1).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Casa -1: vitória por 2+ = GREEN; por 1 = RED.
Três vias em algumas linhas.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Casa -1 · 3-1 → GREEN

## Exemplo RED

Casa -1 · 2-1 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,70 – 2,30 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Médio** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

# Handicap Alternativo

## O que é

Linhas europeias alternativas (-2, +2, etc.).

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Casa -2 · 4-1 → GREEN

## Exemplo RED

Casa -2 · 3-1 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `01-resultados.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- xG e xGA dos últimos 10 jogos
- Forma recente (W-D-L)
- Lesões e suspensões
- Motivação (tabela, mata-mata)

## Perfil ideal

Analista com modelo calibrado e amostra ≥ 10 jogos.

## Perfil ruim

Apostador sem dados; perseguição de odd alta.

## Riscos

- Variância inerente ao futebol
- Gol nos acréscimos altera liquidação
- Dados de última hora (escalação)

## Odds médias

| Contexto | Faixa típica (decimal) |
|----------|------------------------|
| Seleção principal | 1,50 – 4,00 |

Comparar com fair odd: `Fair = 1 / P_real` ([probabilidades.md](../ai/probabilidades.md)).

## Grau de dificuldade

**Médio** — escala Soccer Analytics.

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade |
| Baixo | Favorito claro |
| Médio | Mercado principal |
| Alto | Props / eventos raros |
| Muito Alto | Combinações / hat-trick |

## Checklist

- [ ] Confirmar regra de tempo (90 min vs intervalo)
- [ ] Verificar escalação e ausências
- [ ] Calcular P_real no Analysis/Player Engine
- [ ] Comparar EV = P_real × odd - 1
- [ ] Validar correlação com outras pernas
- [ ] Registrar odd no momento da aposta (CLV)

### Notas Soccer Analytics

- Mercado indexável para agentes de IA em `markets/`.
- Backtest de liquidação: usar exemplos GREEN/RED/VOID acima.
- Correlações: consultar [correlacoes.md](../ai/correlacoes.md).

---

