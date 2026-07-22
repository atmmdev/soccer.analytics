# 02 — Gols

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 02
> **Liquidação padrão:** 90 minutos + acréscimos
> **Referência:** Bet365 (regras gerais)

## Visão geral

Contagem e natureza dos gols. Núcleo Poisson.

**Odds operacionais:** Over 1.5 FT 1,30–1,45 · Over 2.5 FT 1,70–1,95 · BTTS 1,70–2,00 — ver [marcado-de-atuacao.md](../ai/marcado-de-atuacao.md).

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

> **Playbook de análise:** [analysis/over-under-goals.md](../analysis/over-under-goals.md)

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

**Over 2.5 gols** · Final 2-1 (3 gols) → **GREEN** @ 1,95

## Exemplo RED

**Over 2.5** · Final 1-1 (2 gols) → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

| Linha | Over (pré-jogo) |
|-------|-----------------|
| **1.5** | 1,30 – 1,45 |
| **2.5** | 1,70 – 1,95 |
| **3.5** | 2,20 – 2,60 |

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

**Under 3.5 gols** · Final 2-1 (3 gols) → **GREEN** @ 1,90

## Exemplo RED

**Under 3.5** · Final 4-1 (5 gols) → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

> **Playbook de análise:** [analysis/btts.md](../analysis/btts.md)

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

**BTTS Sim** · Final 2-1 → **GREEN** @ 1,75

## Exemplo RED

**BTTS Sim** · Final 2-0 → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

**Primeiro gol Casa** · Final 2-1 (casa abre) → **GREEN** @ 2,10

## Exemplo RED

**Primeiro gol Casa** · Fora abre, final 1-2 → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

**Último gol Fora** · Final 1-2 (fora fecha) → **GREEN** @ 2,30

## Exemplo RED

**Último gol Fora** · Final 2-1 (casa fecha) → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

**Casa não sofre gol Sim** · Final 2-0 → **GREEN** @ 2,50

## Exemplo RED

**Casa não sofre gol Sim** · Final 1-1 → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

Aposta **Sim/Não** se haverá **pelo menos um gol de cabeça** na partida (90 min + acréscimos).

> **Engine Soccer Analytics:** Statistics (roadmap)

## Como funciona

- Critério Opta: gol marcado com cabeça (inclui travesseiro).
- Correlaciona com times fortes no jogo aéreo e escanteios.
- Alta variância — evento raro em jogos de baixa média.

## Como a Bet365 contabiliza

Gol de cabeça válido no TR (Opta). Gol anulado por VAR → removido. Prorrogação não conta.

## Exemplo GREEN

**Gol de cabeça Sim** · Gol de cabeça 1-0 → **GREEN** @ 3,00

## Exemplo RED

**Gol de cabeça Sim** · Final 2-1, todos gols de pé → **RED**

## Mercados relacionados

- [03-escanteios.md](./03-escanteios.md) — jogo aéreo
- [05-chutes.md](./05-chutes.md) — volume ofensivo
- [10-outros-mercados.md](./10-outros-mercados.md)

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

Aposta **Sim/Não** se haverá **gol marcado de fora da área de pênalti** (Opta).

> **Engine Soccer Analytics:** Statistics (roadmap)

## Como funciona

- Evento raro; correlaciona com chutes de longa distância e meias finalizadores.
- Linha de odds alta (3,00+).

## Como a Bet365 contabiliza

Posição do chute no momento do disparo (Opta). Gol anulado VAR → removido. Prorrogação não conta.

## Exemplo GREEN

**Gol fora da área Sim** · Gol de fora 2-1 → **GREEN** @ 5,00

## Exemplo RED

**Gol fora da área Sim** · Final 2-1, todos dentro da área → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

**Gol de pênalti Sim** · Pênalti convertido 1-0 → **GREEN** @ 4,50

## Exemplo RED

**Gol de pênalti Sim** · Sem pênalti ou perdido → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

**Casa marca Sim** · Final 1-0 → **GREEN** @ 1,35

## Exemplo RED

**Casa marca Sim** · Final 0-0 → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

**Fora não marca Sim** · Final 2-0 → **GREEN** @ 1,70

## Exemplo RED

**Fora não marca Sim** · Final 2-1 → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

**Faixa 2-3 gols totais** · Final 2-1 (3 gols) → **GREEN** @ 2,10

## Exemplo RED

**Faixa 2-3 gols** · Final 1-0 (1 gol) → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

Aposta **ao vivo** em qual time marca o **próximo gol** da partida.

> **Engine Soccer Analytics:** Live (roadmap)

## Como funciona

- Odds atualizadas em tempo real conforme placar e tempo.
- Se ninguém marca mais → **VOID** ou opção "Sem mais gols".
- Own goal: regra Bet365 — geralmente conta para o time beneficiado.

## Como a Bet365 contabiliza

Próximo gol após confirmação da aposta. VAR pode anular.

## Exemplo GREEN

**Próximo gol Casa** · Placar 0-0, casa marca 1-0 → **GREEN** @ 2,20

## Exemplo RED

**Próximo gol Casa** · Fora marca 0-1 → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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

**Gol em ambos tempos Sim** · HT 1-0, FT 2-0 → **GREEN** @ 2,80

## Exemplo RED

**Gol ambos tempos Sim** · HT 1-0, FT 1-0 (sem gol 2T) → **RED**

## Exemplo VOID

Partida cancelada ou jogador não titular — VOID.

## Mercados relacionados

- Ver [01-resultados.md](./01-resultados.md), [07-marcadores.md](./07-marcadores.md), [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)

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
---

## Referências

- [../ai/probabilidades.md](../ai/probabilidades.md) — Poisson e Over/Under
- [../ai/correlacoes.md](../ai/correlacoes.md) — BTTS × Over, CS × Under
- [01-resultados.md](./01-resultados.md) — resultado + gols combinados
- [07-marcadores.md](./07-marcadores.md) — props de jogador
- [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md) — gols por período
