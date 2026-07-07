# 04 — Cartões e Faltas

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 04
> **Liquidação padrão:** 90 minutos + acréscimos
> **Referência:** Bet365 (regras gerais)

## Visão geral

Disciplina — λ cartões e árbitro.

### Mercados neste arquivo

| # | Mercado | Engine |
|---|---------|--------|
| 1 | Total Cartões | Poisson |
| 2 | Por Time | Poisson |
| 3 | Primeiro | Poisson |
| 4 | Último | Poisson |
| 5 | Jogador Cartão | Player Engine |
| 6 | Vermelho | Poisson |
| 7 | Ambos Cartão | Poisson |
| 8 | Handicap | Poisson |
| 9 | Asiáticos | Poisson |
| 10 | Faltas | Statistics |

### Integração Soccer Analytics

Cartões: amarelo=1; 2º amarelo+vermelho=2; vermelho direto=1.

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

# Total Cartões

## O que é

Mercado de apostas **Total Cartões** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Total Cartões** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Cartões Por Time

## O que é

Mercado de apostas **Cartões Por Time** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Cartões Por Time** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Primeiro Cartão

## O que é

Mercado de apostas **Primeiro Cartão** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Primeiro Cartão** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Último Cartão

## O que é

Mercado de apostas **Último Cartão** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Último Cartão** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Jogador Recebe Cartão

## O que é

Mercado de apostas **Jogador Recebe Cartão** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Player Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Não titular → VOID

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Cartão Vermelho no Jogo

## O que é

Mercado de apostas **Cartão Vermelho no Jogo** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Cartão Vermelho no Jogo** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Ambos Recebem Cartão

## O que é

Mercado de apostas **Ambos Recebem Cartão** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Ambos Recebem Cartão** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Handicap Cartões

## O que é

Mercado de apostas **Handicap Cartões** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Handicap Cartões** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Cartões Asiáticos

## O que é

Mercado de apostas **Cartões Asiáticos** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Cartões Asiáticos** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

# Total Faltas

## O que é

Mercado de apostas **Total Faltas** no futebol, categoria **Cartões e Faltas**. Oferecido pela Bet365 e casas similares; modelado no Soccer Analytics quando indicado.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Total Faltas** liquidado no tempo regulamentar.
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

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `04-cartoes-faltas.md`

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

