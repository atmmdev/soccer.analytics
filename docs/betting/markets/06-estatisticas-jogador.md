# 06 — Estatísticas de Jogador

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 06
> **Liquidação padrão:** 90 minutos + acréscimos
> **Referência:** Bet365 (regras gerais)

## Visão geral

Props por jogador — Player Engine + MatchPlayerPerformance.

### Mercados neste arquivo

| # | Mercado | Engine |
|---|---------|--------|
| 1 | Passes Completos | Player Engine |
| 2 | Passes Tentados | Player Engine |
| 3 | Assistências | Player Engine |
| 4 | Desarmes | Player Engine |
| 5 | Interceptações | Player Engine |
| 6 | Dribles Concluídos | Player Engine |
| 7 | Faltas Cometidas | Player Engine |
| 8 | Faltas Sofridas | Player Engine |
| 9 | Impedimentos | Player Engine |
| 10 | Chutes do Jogador | Player Engine |
| 11 | Chutes no Gol do Jogador | Player Engine |
| 12 | Gols (prop) | Player Engine |
| 13 | Cartões do Jogador | Player Engine |
| 14 | Defesas do Goleiro | Player Engine |
| 15 | Cruzamentos | Player Engine |
| 16 | Ações de Criação | Player Engine |
| 17 | Toques na Área | Player Engine |
| 18 | Distância Percorrida | Player Engine |
| 19 | xG do Jogador | Player Engine |
| 20 | xA do Jogador | Player Engine |

### Integração Soccer Analytics

λ_stat = média/90 × minutos esperados.

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

# Passes Completos

## O que é

Over/Under (ou Sim/Não) em **Passes Completos** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Passes Completos/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Passes Tentados

## O que é

Over/Under (ou Sim/Não) em **Passes Tentados** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Passes Tentados/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Assistências

## O que é

Over/Under (ou Sim/Não) em **Assistências** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Assistências/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Desarmes

## O que é

Over/Under (ou Sim/Não) em **Desarmes** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Desarmes/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Interceptações

## O que é

Over/Under (ou Sim/Não) em **Interceptações** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Interceptações/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Dribles Concluídos

## O que é

Over/Under (ou Sim/Não) em **Dribles Concluídos** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Dribles Concluídos/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Faltas Cometidas

## O que é

Over/Under (ou Sim/Não) em **Faltas Cometidas** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Faltas Cometidas/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Faltas Sofridas

## O que é

Over/Under (ou Sim/Não) em **Faltas Sofridas** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Faltas Sofridas/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Impedimentos

## O que é

Over/Under (ou Sim/Não) em **Impedimentos** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Impedimentos/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Chutes do Jogador

## O que é

Over/Under (ou Sim/Não) em **Chutes do Jogador** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Chutes do Jogador/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Chutes no Gol do Jogador

## O que é

Over/Under (ou Sim/Não) em **Chutes no Gol do Jogador** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Chutes no Gol do Jogador/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Gols (prop)

## O que é

Over/Under (ou Sim/Não) em **Gols (prop)** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Gols (prop)/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Cartões do Jogador

## O que é

Over/Under (ou Sim/Não) em **Cartões do Jogador** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Cartões do Jogador/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Defesas do Goleiro

## O que é

Over/Under (ou Sim/Não) em **Defesas do Goleiro** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Defesas do Goleiro/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Cruzamentos

## O que é

Over/Under (ou Sim/Não) em **Cruzamentos** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Cruzamentos/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Ações de Criação

## O que é

Over/Under (ou Sim/Não) em **Ações de Criação** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Ações de Criação/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Toques na Área

## O que é

Over/Under (ou Sim/Não) em **Toques na Área** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Toques na Área/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# Distância Percorrida

## O que é

Over/Under (ou Sim/Não) em **Distância Percorrida** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média Distância Percorrida/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# xG do Jogador

## O que é

Over/Under (ou Sim/Não) em **xG do Jogador** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média xG do Jogador/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

# xA do Jogador

## O que é

Over/Under (ou Sim/Não) em **xA do Jogador** do jogador.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Titular obrigatório (Bet365).
Projeção: média xA do Jogador/90 × minutos.
Oponente e posição ajustam expectativa.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Over linha · stat acima → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Reserva → VOID

## Mercados relacionados

- Outros mercados em `06-estatisticas-jogador.md`

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

