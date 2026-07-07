# 03 — Escanteios

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 03
> **Liquidação padrão:** 90 minutos + acréscimos
> **Referência:** Bet365 (regras gerais)

## Visão geral

Cantos — Poisson λ escanteios.

### Mercados neste arquivo

| # | Mercado | Engine |
|---|---------|--------|
| 1 | Total Escanteios | Poisson |
| 2 | Alternativos | Poisson |
| 3 | Por Time | Poisson |
| 4 | Primeiro | Poisson |
| 5 | Último | Poisson |
| 6 | Asiáticos | Poisson |
| 7 | Handicap | Poisson |
| 8 | Por Tempo | Poisson |
| 9 | Intervalo | Poisson |
| 10 | Exatos | Poisson |
| 11 | Primeiro a X | Poisson |

### Integração Soccer Analytics

λ = f(média casa, média fora, estilo posse).

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

# Total Escanteios

## O que é

Mercado de apostas **Total Escanteios** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Total Escanteios** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Total Escanteios)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Escanteios Alternativos

## O que é

Mercado de apostas **Escanteios Alternativos** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Escanteios Alternativos** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Escanteios Alternativos)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Escanteios Por Time

## O que é

Mercado de apostas **Escanteios Por Time** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Escanteios Por Time** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Escanteios Por Time)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Primeiro Escanteio

## O que é

Mercado de apostas **Primeiro Escanteio** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Primeiro Escanteio** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Primeiro Escanteio)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Último Escanteio

## O que é

Mercado de apostas **Último Escanteio** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Último Escanteio** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Último Escanteio)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Escanteios Asiáticos

## O que é

Mercado de apostas **Escanteios Asiáticos** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Escanteios Asiáticos** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Escanteios Asiáticos)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Handicap Escanteios

## O que é

Mercado de apostas **Handicap Escanteios** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Handicap Escanteios** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Handicap Escanteios)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Escanteios Por Tempo

## O que é

Mercado de apostas **Escanteios Por Tempo** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Escanteios Por Tempo** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Escanteios Por Tempo)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Escanteios Intervalo

## O que é

Mercado de apostas **Escanteios Intervalo** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Escanteios Intervalo** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Escanteios Intervalo)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Escanteios Exatos

## O que é

Mercado de apostas **Escanteios Exatos** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Escanteios Exatos** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Escanteios Exatos)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

# Primeiro a X Escanteios

## O que é

Mercado de apostas **Primeiro a X Escanteios** no futebol, categoria **Escanteios**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Primeiro a X Escanteios** liquidado no tempo regulamentar.
λ estimado: média histórica ajustada por xG/xGA e contexto.
```
P(k) = (λ^k × e^-λ) / k!
P(Over L) = 1 - Σ P(k) para k ≤ floor(L)
```
Matriz de placares para mercados dependentes de gols de ambos os times.

## Como a Bet365 contabiliza

Gols em acréscimos do 1º e 2º tempo **contam**.
Gols contra: atribuídos ao time beneficiado; não ao adversário em props de jogador.
Partida abandonada: regras específicas; geralmente VOID se < 90 min.
Prorrogação **não** conta salvo mercado explícito (qualificação, método vitória).

## Exemplo GREEN

Over 9.5 · 11 cantos → GREEN (exemplo Primeiro a X Escanteios)

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `03-escanteios.md`

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

