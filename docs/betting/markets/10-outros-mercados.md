# 10 — Outros Mercados

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 10  
> **Natureza:** estatísticas especiais, props raras, promocionais e Bet Builder  
> **Engine:** Statistics (roadmap) · regras comerciais para promos

## Visão geral

Mercados **fora do core** (gols, resultados, cantos, cartões principais): tiros de meta, impedimentos, defesas, posse, laterais, acréscimos, especiais e ofertas promocionais. Liquidez e disponibilidade **variáveis** por competição na Bet365.

### Mercados neste arquivo

| # | Mercado | Dificuldade |
|---|---------|-------------|
| 1 | Total Tiros de Meta | Alto |
| 2 | Total Impedimentos | Alto |
| 3 | Total Defesas do Goleiro | Médio |
| 4 | Posse de Bola | Alto |
| 5 | Total Arremessos Laterais | Alto |
| 6 | Tempo de Acréscimo | Muito Alto |
| 7 | Mercados Especiais | Muito Alto |
| 8 | Mercados Promocionais | Variável |
| 9 | Criar Aposta (Bet Builder) | Alto |
| 10 | Empate Devolve (Promo) | Baixo |

---

# Total Tiros de Meta

## O que é

Over/Under em **goal kicks** (tiros de meta) — reposição do goleiro quando bola sai pela linha de fundo offensiva.

## Como funciona

- Correlaciona **++** com pressão adversária, chutes bloqueados, defesas.
- Cadeia: favorito ataca → bloqueio/defesa → tiro de meta.
- Dados Opta; mercado disponível em competições selecionadas.

## Como a Bet365 contabiliza

Cada tiro de meta **executado** conta. Tempo regulamentar + acréscimos.

## Exemplo GREEN

**Over 14.5 tiros de meta** · Total **16** → **GREEN** @ 1,90

## Exemplo RED

**14** tiros de meta → **RED**

## Exemplo VOID

Jogo cancelado → **VOID**

## Mercados relacionados

- Defesas goleiro
- Chutes bloqueados
- Escanteios
- [../ai/correlacoes.md](../ai/correlacoes.md)

## Quando utilizar

- Favorito domina vs bloco baixo
- Adversário jogo direto (mais repulsões)

## Quando evitar

- Posse 50-50 sem pressão
- Dados indisponíveis

## Indicadores importantes

- Tiros de meta/jogo (10j)
- Chutes adversário
- Posse %
- Escanteios

## Perfil ideal

- City vs Burnley type

## Perfil ruim

- Jogo equilibrado posse

## Riscos

- Liquidez baixa
- Dados raros no Soccer Analytics (roadmap)

## Odds médias

1,85 – 2,05

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Fonte Opta confirmada
- [ ] Correlação cantos/chutes validada

---

# Total Impedimentos

## O que é

Over/Under em **impedimentos** marcados pelo assistente.

## Como funciona

- Times com linha alta (estrategiamente ou por profundidade) → mais impedimentos.
- Defesa alta adversária correlaciona.

## Como a Bet365 contabiliza

Cada bandeira de impedimento conta (inclui impedimentes "quase" sem toque se marcado).

## Exemplo GREEN

**Over 3.5 impedimentos** · **5** → **GREEN**

## Exemplo RED

**3** → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Chutes
- Gols (defesas altas)

## Quando utilizar

- Time offside trap conhecido
- Atacante velocista vs defesa alta

## Quando evitar

- Jogo lento meio-campo

## Indicadores importantes

- Impedimentos/jogo
- Estilo defesa (linha alta)

## Perfil ideal

- Liverpool vs defesa alta

## Perfil ruim

- Bloco baixo

## Riscos

- VAR não revisa impedimento na aposta

## Odds médias

1,85 – 2,10

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Histórico impedimentos ≥ 10 jogos

---

# Total Defesas do Goleiro

## O que é

Over/Under em **defesas (saves)** do goleiro — uma ou ambas equipes.

## Como funciona

- Correlaciona **++** com SOT adversário.
- Goleiro xSV alto → muitas defesas, poucos gols sofridos.
- Útil quando Over gols não tem edge mas volume chutes sim.

## Como a Bet365 contabiliza

Intervenção goleiro impedindo gol (Opta save definition).

## Exemplo GREEN

**Over 5.5 defesas goleiro casa** · **7** → **GREEN**

## Exemplo RED

**5** → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- SOT
- xSV / PSxG
- Under gols

## Quando utilizar

- Goleiro elite vs ataque forte
- xG alto, conversão baixa esperada

## Quando evitar

- Jogo sem chutes (Under shots)

## Indicadores importantes

- Saves/jogo
- SOT faced
- xSV

## Perfil ideal

- Alisson vs Arsenal

## Perfil ruim

- 0-0 sem chutes

## Riscos

- Definição save vs bloco

## Odds médias

1,85 – 2,00

## Grau de dificuldade

**Médio**

## Checklist

- [ ] SOT adversário projetado > linha saves

---

# Posse de Bola

## O que é

Aposta em **percentual de posse** ou Over/Under posse de um time (ex.: Casa Over 58.5%).

## Como funciona

- Posse **≠** vitória (posse estéril).
- Modelo estatístico fraco isolado; usar com estilo tático confirmado.

## Como a Bet365 contabiliza

Percentual oficial provedor (Opta) ao fim do TR.

## Exemplo GREEN

**Casa Over 58.5% posse** · **62%** → **GREEN**

## Exemplo RED

**55%** → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Chutes
- Escanteios
- Passes

## Quando utilizar

- Dominância posse extrema esperada (City 65%+)
- Adversário só contra-ataque

## Quando evitar

- Prever resultado só com posse
- Jogo equilibrado

## Indicadores importantes

- Posse média 10j
- Estilo (tiki-taka vs direct)
- PPDA adversário

## Perfil ideal

- City/Liverpool vs bloco

## Perfil ruim

- Derby equilibrado

## Riscos

- Posse sem chances (posse estéril)

## Odds médias

1,85 – 2,05

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Não usar posse como proxy de vitória
- [ ] EV marginal — stake reduzido

---

# Total Arremessos Laterais

## O que é

Over/Under em **throw-ins** (laterais).

## Como funciona

- Jogo físico, bolas longas, defesas altas → mais laterais.
- Menos correlacionado com gols que cantos.

## Como a Bet365 contabiliza

Cada lateral executada conta.

## Exemplo GREEN

**Over 35.5 laterais** · **38** → **GREEN**

## Exemplo RED

**34** → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Impedimentos
- Chutes fora

## Quando utilizar

- Estilo jogo direto
- Dados históricos estáveis

## Quando evitar

- Tiki-taka curto

## Indicadores importantes

- Laterais/jogo
- Estilo jogo

## Perfil ideal

- PL física

## Perfil ruim

- Possession teams

## Riscos

- Dados escassos
- Liquidez

## Odds médias

1,85 – 2,05

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Amostra laterais ≥ 15 jogos

---

# Tempo de Acréscimo

## O que é

Over/Under em **minutos de acréscimo** (1T, 2T ou total) — mercado raro.

## Como funciona

- Árbitro, VAR, lesões, substituições, tempo perdido influenciam.
- **Imprevisível** — edge difícil.

## Como a Bet365 contabiliza

Minutos indicados pelo 4º árbitro no placar eletrônico (pode variar).

## Exemplo GREEN

**Over 9.5 min acréscimo total** · 11 min → **GREEN**

## Exemplo RED

8 min → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Cartões (interrupções)
- VAR specials

## Quando utilizar

- Árbitro conhecido por acréscimos longos
- Final copa com muitas substituições

## Quando evitar

- Quase sempre — variância extrema

## Indicadores importantes

- Média acréscimo árbitro
- Importância jogo (final)

## Perfil ideal

- Árbitro +10 min média

## Perfil ruim

- Liga rápida

## Riscos

- **Muito Alto** — modelo fraco

## Odds médias

1,90 – 2,10

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Stake mínimo
- [ ] Dados árbitro específicos

---

# Mercados Especiais

## O que é

Props **únicas** por partida: gol de escanteio, gol olímpico, VAR decisivo, pênalti marcado, etc.

## Como funciona

Cada mercado tem regra própria no boletim Bet365. Odds altas, baixa previsibilidade.

## Como a Bet365 contabiliza

**Varia por mercado** — ler termos específicos antes de apostar.

Exemplos comuns:
| Especial | GREEN quando |
|----------|--------------|
| Gol de escanteio | Gol direto ou tocado de escanteio |
| Pênalti marcado | Árbitro marca pênalti (gol ou não) |
| Expulsão | Vermelho qualquer time |

## Exemplo GREEN

**Pênalti marcado Sim** · Pênalti 78' (perdido) → **GREEN** @ 2,50

## Exemplo RED

Sem pênalti → **RED**

## Exemplo VOID

Abandono antes evento → **VOID**

## Mercados relacionados

- Cartão vermelho
- Mercados promocionais

## Quando utilizar

- Edge identificado em frequência histórica (ex.: time muitos pênaltis)
- Entretenimento stake mínimo

## Quando evitar

- Default — variância extrema

## Indicadores importantes

- Frequência evento específico
- Estilo time
- Árbitro pênaltis

## Perfil ideal

- Analista com dados evento

## Perfil ruim

- Aposta recreativa sem base

## Riscos

- Regras ambíguas
- Impossível modelar bem

## Odds médias

2,50 – 15,00+

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Ler termos Bet365 integralmente
- [ ] Stake ≤ 0,25% banca

---

# Mercados Promocionais

## O que é

Ofertas comerciais: **odds boost**, **aposta segura**, **bônus acumulador**, **cashback**, **early payout** (2 gols ahead).

## Como funciona

- **Não são mercados estatísticos** — são condições comerciais.
- Margem embutida; termos restritivos (max stake, mercados elegíveis).

## Como a Bet365 contabiliza

Conforme **termos da promoção** (T&C).

## Exemplo GREEN

**Odds boost** City 1.80 → 2.00 · City vence → paga boost

## Exemplo RED

Seleção perde → RED normal

## Exemplo VOID

Conforme T&C promo

## Mercados relacionados

- Empate devolve promo
- Bet Builder boosts

## Quando utilizar

- Boost em seleção que **já teria EV+** na odd base
- Early payout como seguro implícito (avaliar valor)

## Quando evitar

- Apostar só pelo boost sem edge
- Ignorar T&C (limites, elegibilidade)

## Indicadores importantes

- Comparar odd boost vs fair odd
- CLV na odd base

## Perfil ideal

- Apostador que já ia apostar + EV

## Perfil ruim

- Chase de promo

## Riscos

- Limitação conta
- Termos ocultos

## Odds médias

N/A — variável

## Grau de dificuldade

**Variável**

## Checklist

- [ ] Ler T&C completo
- [ ] EV na odd **base** ainda positivo
- [ ] Não forçar aposta por promo

---

# Criar Aposta (Bet Builder)

## O que é

**Same Game Multi** — combinar mercados **da mesma partida** (ex.: Casa + Over 2.5 + Haaland marca).

## Como funciona

- Bet365 calcula odd combinada com **correlação embutida**.
- Geralmente **menor** que produto naive das odds.
- Soccer Analytics: validar com [correlacoes.md](../ai/correlacoes.md).

## Como a Bet365 contabiliza

Todas seleções devem ganhar. Void parcial conforme regras builder.

## Exemplo GREEN

Builder: **Casa + Over 2.5 + BTTS Sim** · Final 3-1 → **GREEN** @ 4,50

## Exemplo RED

3-0 → BTTS RED

## Exemplo VOID

Jogador não titular prop → leg VOID, odd recalculada

## Mercados relacionados

- Todos mercados mesma partida
- [../ai/correlacoes.md](../ai/correlacoes.md)

## Quando utilizar

- Correlação positiva desejada (narrativa coerente)
- Odd builder > fair combinada modelada

## Quando evitar

- Combinações ++ correlacionadas sem edge (Casa + Over + BTTS sem EV)
- Builder por conveniência UI

## Indicadores importantes

- P conjunta Poisson (matriz)
- Penalidade correlação Score IA

## Perfil ideal

- Narrativa tática clara (jogo aberto + favorito)

## Perfil ruim

- Random combo

## Riscos

- Margem alta
- Correlação subestimada pelo apostador

## Odds médias

3,00 – 12,00+

## Grau de dificuldade

**Alto**

## Checklist

- [ ] P conjunta calculada
- [ ] Comparar odd builder vs fair
- [ ] Penalidade correlação aplicada
- [ ] Ticket Engine Soccer Analytics

---

# Empate Devolve Aposta (Promo)

## O que é

Promoção: aposta **1X2** em time; se **empatar**, **stake devolvido** (como DNB gratuito).

## Como funciona

- Equivalente comercial a **Empate Anula** com odd ligeiramente inferior ao 1X2 puro.
- Avaliar se odd promo > odd DNB normal.

## Como a Bet365 contabiliza

Vitória → GREEN odd promo · Empate → VOID stake · Derrota → RED

## Exemplo GREEN

**Casa promo empate devolve** · 2-1 → **GREEN** @ 1,95

## Exemplo RED

0-1 → **RED**

## Exemplo VOID (empate)

1-1 → stake devolvido

## Mercados relacionados

- Empate Anula
- Handicap 0.0

## Quando utilizar

- Odd promo superior a DNB equivalente
- Quer cobertura empate sem pagar DNB

## Quando evitar

- Odd promo pior que DNB mercado normal

## Indicadores importantes

- Comparar odd promo vs DNB vs 1X2

## Perfil ideal

- Favorito estreito

## Perfil ruim

- Quando DNB mercado tem odd melhor

## Riscos

- T&C stake max
- Só eligible competitions

## Odds médias

1,85 – 2,10 (promo) vs DNB 1,65–1,85

## Grau de dificuldade

**Baixo** (entender regras)

## Checklist

- [ ] Comparar 3 vias: 1X2, DNB, promo
- [ ] EV inclui VOID no empate
- [ ] T&C promo lido

---

## Roadmap Soccer Analytics

| Mercado | Importação API | Modelo |
|---------|----------------|--------|
| Defesas / Shots | ✅ MatchStatistics | Roadmap |
| Posse | ✅ | Heurística |
| Tiros de meta | 🔜 | — |
| Impedimentos | 🔜 | — |
| Laterais | 🔜 | — |
| Bet Builder | ✅ Ticket Engine | Correlação |

---

## Referências

- [../ai/correlacoes.md](../ai/correlacoes.md)
- [../ai/value-bet.md](../ai/value-bet.md)
- Ticket Engine: `apps/api/src/engines/ticket-engine/`
