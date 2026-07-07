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

Contagem Opta de passes completados. Titular obrigatório; saída antes do apito final — stat congelada no minuto de saída. Acréscimos contam.

## Exemplo GREEN

**Rodri Over 68.5 passes completos** · 72 completados → **GREEN** @ 1,87

## Exemplo RED

**Rodri Over 68.5** · 65 completados → **RED**

## Exemplo VOID

Jogador reserva (não titular) → **VOID**

## Mercados relacionados

- [Passes Tentados](#passes-tentados)
- [Ações de Criação](#ações-de-criação)
- Posse de bola ([10-outros-mercados.md](./10-outros-mercados.md))

## Quando utilizar

- Meio-campista titular em time dominante posse
- Adversário baixo bloco (mais passes laterais/back)

## Quando evitar

- Jogo direto / poucos passes esperados
- Risco de substituição antes dos 60'

## Indicadores importantes

- Passes completos/90 (últimos 10)
- Posse média do time
- Minutos esperados (titular)

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

Todos passes tentados (completos + incompletos). Critério Opta. Titular obrigatório.

## Exemplo GREEN

**Bruno Fernandes Over 82.5 tentados** · 89 → **GREEN** @ 1,90

## Exemplo RED

**Over 82.5** · 78 tentados → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Passes Completos](#passes-completos)
- Taxa de acerto = completos/tentados

## Quando utilizar

- Criador ofensivo titular
- Time favorito com posse alta

## Quando evitar

- Jogador substituído cedo habitualmente

## Indicadores importantes

- Tentados/90
- % posse time
- PPDA adversário

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

Passe ou toque que leva diretamente ao gol (Opta). Gol anulado por VAR → assistência removida se gol anulado.

## Exemplo GREEN

**Salah marcar assistência** · Gol 2-0 aos 67' → **GREEN** @ 3,20

## Exemplo RED

**Salah assistência** · 0 assistências → **RED**

## Exemplo VOID

Não titular → **VOID**

## Mercados relacionados

- [07-marcadores.md](./07-marcadores.md)
- [xA do Jogador](#xa-do-jogador)
- [Ações de Criação](#ações-de-criação)

## Quando utilizar

- Extremo/ME criador vs defesa frágil
- xA/90 elevado

## Quando evitar

- Odd muito baixa sem volume esperado

## Indicadores importantes

- xA, assistências/90
- Chances criadas
- Adversário xGA alto

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

Desarmes bem-sucedidos (Opta tackle won). Acréscimos contam.

## Exemplo GREEN

**Casemiro Over 3.5 desarmes** · 5 → **GREEN** @ 1,95

## Exemplo RED

**Over 3.5** · 2 desarmes → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Interceptações](#interceptações)
- [04-cartoes-faltas.md](./04-cartoes-faltas.md)

## Quando utilizar

- Volante destruidor vs meio criativo
- Adversário posse alta

## Quando evitar

- Jogo de um time só (poucos duelos)

## Indicadores importantes

- Desarmes/90
- PPDA time
- Posse adversária

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

Interceptação de passe adversário (Opta).

## Exemplo GREEN

**Kanté Over 1.5 interceptações** · 3 → **GREEN** @ 1,85

## Exemplo RED

**Over 1.5** · 1 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Desarmes](#desarmes)
- Pressing (PPDA)

## Quando utilizar

- Meio defensivo vs jogo de passes

## Quando evitar

- Jogo direto, poucos passes adversários

## Indicadores importantes

- Interceptações/90
- Passes adversário tentados

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

Drible concluído com sucesso (Opta).

## Exemplo GREEN

**Vinícius Over 2.5 dribles** · 4 → **GREEN** @ 2,00

## Exemplo RED

**Over 2.5** · 1 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Chutes do Jogador](#chutes-do-jogador)
- Extremos vs laterais fracos

## Quando utilizar

- Extremo 1v1 vs defesa lenta

## Quando evitar

- Adversário bloco compacto, pouco espaço

## Indicadores importantes

- Dribles/90
- Duelos ganhos
- xThreat

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

Faltas cometidas pelo jogador (Opta). Cartão por falta ainda conta como falta.

## Exemplo GREEN

**Casemiro Over 1.5 faltas cometidas** · 3 → **GREEN** @ 1,80

## Exemplo RED

**Over 1.5** · 0 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [04-cartoes-faltas.md](./04-cartoes-faltas.md)
- [Faltas Sofridas](#faltas-sofridas)

## Quando utilizar

- Volante/agressor vs dribladores

## Quando evitar

- Árbitro permissivo sem faltas

## Indicadores importantes

- Faltas/90
- Estilo árbitro
- Adversário dribles/jogo

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

Faltas sofridas pelo jogador (Opta).

## Exemplo GREEN

**Grealish Over 2.5 faltas sofridas** · 4 → **GREEN** @ 1,90

## Exemplo RED

**Over 2.5** · 1 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Faltas Cometidas](#faltas-cometidas)
- Extremos velocistas

## Quando utilizar

- Jogador referência com dribles

## Quando evitar

- Adversário não marca homem a homem

## Indicadores importantes

- Faltas sofridas/90
- Dribles tentados

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

Impedimentos marcados contra o jogador (Opta).

## Exemplo GREEN

**Haaland Over 0.5 impedimentos** · 2 → **GREEN** @ 1,75

## Exemplo RED

**Over 0.5** · 0 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [10-outros-mercados.md](./10-outros-mercados.md)
- Defesa linha alta adversária

## Quando utilizar

- Atacante profundo vs defesa alta

## Quando evitar

- Bloco baixo, sem linha alta

## Indicadores importantes

- Impedimentos/90
- Profundidade média defesa adversária

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

Finalizações do jogador (Opta shot definition). Bloqueios podem contar.

## Exemplo GREEN

**Haaland Over 3.5 chutes** · 5 → **GREEN** @ 1,88

## Exemplo RED

**Over 3.5** · 2 chutes → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [05-chutes.md](./05-chutes.md)
- [Chutes no Gol do Jogador](#chutes-no-gol-do-jogador)

## Quando utilizar

- Atacante central titular
- xG/90 alto

## Quando evitar

- Jogador recuado / extremo sem chute

## Indicadores importantes

- Chutes/90
- xG jogador
- Minutos esperados

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

SOT do jogador (Opta). Trave conta se entraria.

## Exemplo GREEN

**Kane Over 1.5 SOT** · 3 → **GREEN** @ 2,05

## Exemplo RED

**Over 1.5** · 1 SOT → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Chutes do Jogador](#chutes-do-jogador)
- [xG do Jogador](#xg-do-jogador)

## Quando utilizar

- Finalizador vs defesa permeável

## Quando evitar

- xG baixo, chutes de longe

## Indicadores importantes

- SOT/90
- xG/90
- Conversão histórica

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

Gol marcado pelo jogador (90 min + acréscimos). Gol contra **não** conta. Titular obrigatório.

## Exemplo GREEN

**Haaland Over 0.5 gols** · 2 gols → **GREEN** @ 1,65

## Exemplo RED

**Over 0.5** · 0 gols → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [07-marcadores.md](./07-marcadores.md)
- [xG do Jogador](#xg-do-jogador)

## Quando utilizar

- Pênalti taker / centroavante vs xGA alto

## Quando evitar

- Sem dados MatchPlayerPerformance

## Indicadores importantes

- Gols/90, xG/90
- λ Poisson Player Engine

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

Amarelo ou vermelho ao jogador conta. Dois amarelos = vermelho (2 cartões). Comissão técnica excluída.

## Exemplo GREEN

**Casemiro receber cartão Sim** · Amarelo 34' → **GREEN** @ 2,40

## Exemplo RED

**Receber cartão Sim** · sem cartão → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [04-cartoes-faltas.md](./04-cartoes-faltas.md)
- Árbitro e faltas/90

## Quando utilizar

- Jogador agressivo + árbitro rigoroso

## Quando evitar

- Árbitro permissivo

## Indicadores importantes

- Cartões/90
- Faltas/90
- Histórico árbitro

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

Defesas (saves) do goleiro titular — Opta save definition.

## Exemplo GREEN

**Alisson Over 2.5 defesas** · 4 → **GREEN** @ 1,85

## Exemplo RED

**Over 2.5** · 1 defesa → **RED**

## Exemplo VOID

Goleiro reserva → **VOID**

## Mercados relacionados

- [10-outros-mercados.md](./10-outros-mercados.md)
- SOT adversário projetado

## Quando utilizar

- Goleiro vs ataque forte (muitos SOT)

## Quando evitar

- Jogo sem chutes (Under shots)

## Indicadores importantes

- Saves/90
- SOT faced
- xSV

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

Cruzamentos do jogador (Opta cross).

## Exemplo GREEN

**Alexander-Arnold Over 4.5 cruzamentos** · 7 → **GREEN** @ 1,90

## Exemplo RED

**Over 4.5** · 3 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- Laterais ofensivos
- Escanteios ([03-escanteios.md](./03-escanteios.md))

## Quando utilizar

- Lateral/alas vs defesa baixa

## Quando evitar

- Jogo pelo meio, poucos cruzamentos

## Indicadores importantes

- Cruzamentos/90
- xA de cruzamento

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

Key passes + ações que levam a chute (Opta shot-creating actions).

## Exemplo GREEN

**De Bruyne Over 3.5 ações criação** · 5 → **GREEN** @ 1,92

## Exemplo RED

**Over 3.5** · 2 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Assistências](#assistências)
- [xA do Jogador](#xa-do-jogador)

## Quando utilizar

- Meia criador titular
- Adversário concede muitas chances

## Quando evitar

- Time ultra-defensivo

## Indicadores importantes

- SCA/90
- xA
- Chances criadas

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

Toques dentro da área adversária (Opta touches in box).

## Exemplo GREEN

**Salah Over 5.5 toques na área** · 8 → **GREEN** @ 1,88

## Exemplo RED

**Over 5.5** · 4 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [xG do Jogador](#xg-do-jogador)
- Presença na área

## Quando utilizar

- Atacante de área vs defesa alta

## Quando evitar

- Extremo recuado

## Indicadores importantes

- Toques área/90
- xG
- Entradas área

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

Distância total percorrida (Opta, km). Disponível em competições selecionadas.

## Exemplo GREEN

**Declan Rice Over 10.5 km** · 11,2 km → **GREEN** @ 1,85

## Exemplo RED

**Over 10.5 km** · 9,8 km → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- Meio box-to-box
- Pressing alto

## Quando utilizar

- Meio volume alto vs posse equilibrada

## Quando evitar

- Dados indisponíveis na competição

## Indicadores importantes

- km/jogo
- PPDA
- Minutos

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

Mercado de linha sobre xG **ou** proxy via chutes/SOT conforme disponibilidade Bet365. Confirmar definição no boletim.

## Exemplo GREEN

**Haaland Over 0.8 xG (linha)** · xG 1,12 → **GREEN** @ 1,90

## Exemplo RED

**Over 0.8 xG** · xG 0,45 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Gols (prop)](#gols-prop)
- [07-marcadores.md](./07-marcadores.md)

## Quando utilizar

- Modelo xG calibrado
- Atacante central titular

## Quando evitar

- Mercado sem definição clara no boletim

## Indicadores importantes

- xG/90
- Chutes/SOT
- Qualidade chances

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

Linha sobre xA esperado ou proxy de chances criadas — ver boletim.

## Exemplo GREEN

**De Bruyne Over 0.4 xA** · xA 0,62 → **GREEN** @ 2,00

## Exemplo RED

**Over 0.4 xA** · xA 0,18 → **RED**

## Exemplo VOID

Reserva → **VOID**

## Mercados relacionados

- [Assistências](#assistências)
- [Ações de Criação](#ações-de-criação)

## Quando utilizar

- Criador vs defesa frágil

## Quando evitar

- Amostra xA instável

## Indicadores importantes

- xA/90
- Key passes
- SCA

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
---

## Referências

- [../ai/indicadores.md](../ai/indicadores.md) — stats por jogador
- [../ai/correlacoes.md](../ai/correlacoes.md) — props correlacionados
- [07-marcadores.md](./07-marcadores.md) — gols e anytime scorer
- [05-chutes.md](./05-chutes.md) — chutes e SOT
- [04-cartoes-faltas.md](./04-cartoes-faltas.md) — cartões e faltas por jogador
