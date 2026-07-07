# 02 — Gols

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 02
> **Liquidação padrão:** 90 minutos + acréscimos
> **Referência:** Bet365 (regras gerais)

## Visão geral

Contagem e natureza dos gols. Núcleo Poisson.

### Mercados neste arquivo

| # | Mercado | Engine |
|---|---------|--------|
| 1 | Over/Under Gols | Poisson |
| 2 | Over Alternativo | Poisson |
| 3 | BTTS | Poisson |
| 4 | Primeiro Gol | Poisson |
| 5 | Último Gol | Poisson |
| 6 | Sem Sofrer Gol | Poisson |
| 7 | Gol Cabeça | Statistics |
| 8 | Gol Fora Área | Statistics |
| 9 | Gol Pênalti | Poisson |
| 10 | Time Marca | Poisson |
| 11 | Time Não Marca | Poisson |
| 12 | Faixa Gols | Poisson |
| 13 | Próximo Gol | Live |
| 14 | Gol Ambos Tempos | Poisson |

### Integração Soccer Analytics

λ_total e matriz para BTTS, placares e ordem de gols.

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

# Over/Under Gols

## O que é

Total gols Over/Under linha principal (2.5).

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **O/U** liquidado no tempo regulamentar.
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

O2.5 · 2-1 → GREEN

## Exemplo RED

O2.5 · 1-1 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Over/Under Alternativo

## O que é

Linhas 0.5–6.5+.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **Alt** liquidado no tempo regulamentar.
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

U3.5 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Ambas Marcam (BTTS)

## O que é

Sim: ambos ≥1 gol. Não: algum zera.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **BTTS** liquidado no tempo regulamentar.
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

BTTS Sim · 2-1 → GREEN

## Exemplo RED

BTTS Sim · 2-0 → RED

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Primeiro Gol

## O que é

Time do primeiro gol ou Nenhum.

> **Engine Soccer Analytics:** Analysis Engine (Poisson)

## Como funciona

Mercado **1º** liquidado no tempo regulamentar.
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

Casa abre · Casa → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Último Gol

## O que é

Time do último gol.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Fora fecha 1-2 → Fora GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Sem Sofrer Gol

## O que é

Clean sheet por time.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Casa CS Sim · 2-0 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Gol de Cabeça

## O que é

Haverá gol de cabeça.

> **Engine Soccer Analytics:** Statistics (roadmap)

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Gol Fora da Área

## O que é

Gol de fora da grande área.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Gol de Pênalti

## O que é

Gol convertido de pênalti.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Pênalti convertido → Sim GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Time Marca

## O que é

Time marca ≥1.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Casa Sim · 1-0 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Time Não Marca

## O que é

Time não marca.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Fora Não · 2-0 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Faixa de Gols

## O que é

0-1, 2-3, 4-6, 7+.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

2-3 · 2-1 → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

# Próximo Gol

## O que é

Ao vivo — próximo gol.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

Seleção correta — GREEN.

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

## Quando utilizar

- Edge positivo no modelo Soccer Analytics
- Indicadores alinhados com a seleção
- Liquidez e odd estável no mercado

## Quando evitar

- Sem modelo live

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

# Gol em Ambos os Tempos

## O que é

Gol 1T e gol 2T.

> **Engine Soccer Analytics:** Analysis Engine

## Como funciona

Selecione o desfecho entre as opções da casa. A liquidação ocorre ao fim do período definido (90 min + acréscimos do tempo regulamentar), salvo indicação em contrário no boletim.

## Como a Bet365 contabiliza

Tempo regulamentar (90 min + acréscimos). Critério Opta/Stats Perform. Gols contra contam para o time beneficiado.

## Exemplo GREEN

1-0 HT, 2-0 FT → GREEN

## Exemplo RED

Seleção incorreta — RED.

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Outros mercados em `02-gols.md`

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

