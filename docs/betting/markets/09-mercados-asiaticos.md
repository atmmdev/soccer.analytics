# 09 — Mercados Asiáticos

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 09
> **Liquidação padrão:** 90 minutos + acréscimos
> **Referência:** Bet365 (regras gerais)

## Visão geral

Linhas .25/.75 — push e meio green.

### Mercados neste arquivo

| # | Mercado | Engine |
|---|---------|--------|
| 1 | AH Gols | Poisson |
| 2 | OU Asiático Gols | Poisson |
| 3 | AH Escanteios | Poisson |
| 4 | OU Asiático Escanteios | Poisson |
| 5 | AH Cartões | Poisson |
| 6 | OU Asiático Cartões | Poisson |
| 7 | AH 1º Tempo | Poisson |
| 8 | OU Asiático 1º Tempo | Poisson |
| 9 | AH 2º Tempo | Poisson |
| 10 | OU Asiático 2º Tempo | Poisson |

### Integração Soccer Analytics

Matriz Poisson + regras de split em quartos.

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

# Handicap Asiático Gols

## O que é

Mercado de apostas **Handicap Asiático Gols** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Over/Under Asiático Gols

## O que é

Mercado de apostas **Over/Under Asiático Gols** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Handicap Asiático Escanteios

## O que é

Mercado de apostas **Handicap Asiático Escanteios** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Over/Under Asiático Escanteios

## O que é

Mercado de apostas **Over/Under Asiático Escanteios** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Handicap Asiático Cartões

## O que é

Mercado de apostas **Handicap Asiático Cartões** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Over/Under Asiático Cartões

## O que é

Mercado de apostas **Over/Under Asiático Cartões** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Handicap Asiático 1º Tempo

## O que é

Mercado de apostas **Handicap Asiático 1º Tempo** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Over/Under Asiático 1º Tempo

## O que é

Mercado de apostas **Over/Under Asiático 1º Tempo** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Handicap Asiático 2º Tempo

## O que é

Mercado de apostas **Handicap Asiático 2º Tempo** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

# Over/Under Asiático 2º Tempo

## O que é

Mercado de apostas **Over/Under Asiático 2º Tempo** no futebol, categoria **Mercados Asiáticos**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Linhas .25/.75 dividem stake.
Push em linha inteira.
Ex.: -0.25 perde metade se empate.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Casa -0.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `09-mercados-asiaticos.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Amostra estatística insuficiente
- Notícia de lesão não precificada
- Correlação excessiva no bilhete

## Indicadores importantes

- λ total (Poisson) e xG combinado
- Média de gols da liga
- Ritmo (PPDA, finalizações)
- Contexto tático (precisa ganhar vs administrar)

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

