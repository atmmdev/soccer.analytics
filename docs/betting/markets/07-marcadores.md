# 07 — Marcadores

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 07  
> **Liquidação padrão:** 90 minutos + acréscimos  
> **Engine principal:** Player Engine + matriz Poisson (contexto de gols do time)

## Visão geral

Mercados de **quem marca gol** — primeiro, último, a qualquer momento, múltiplos gols ou hat-trick. Alta variância; exigem dados de jogador (minutos, gols/90, titularidade) e contexto ofensivo do time (xG, λ).

### Mercados neste arquivo

| # | Mercado | Engine | Dificuldade |
|---|---------|--------|-------------|
| 1 | Primeiro Marcador | Player Engine | Muito Alto |
| 2 | Último Marcador | Player Engine | Muito Alto |
| 3 | Anytime Marcador (Qualquer Momento) | Player Engine | Alto |
| 4 | Marcador 2+ Gols | Player Engine | Muito Alto |
| 5 | Hat-Trick | Player Engine | Muito Alto |

### Modelo Soccer Analytics

```
λ_jogador = (gols/90) × minutos_esperados × (xG_time / xG_médio)
P(marcar ≥1) = 1 - e^(-λ_jogador)     [Poisson]
P(primeiro) ≈ P(marcar) × fator_abertura
```

Sem histórico em `MatchPlayerPerformance` → **SKIP** (sem modelo).

---

# Primeiro Marcador

## O que é

Aposta em qual jogador marca o **primeiro gol** da partida (tempo regulamentar). Se ninguém marca → geralmente **VOID** ou opção "Sem gol" dependendo da casa.

## Como funciona

- Lista de jogadores + odd cada um; às vezes "Nenhum marcador" ou defensor.
- **Own goal:** na Bet365, o primeiro gol contra normalmente **não** conta como "marcador" do adversário — verifica regra "No Goalscorer" ou atribuição ao time.
- Probabilidade ≈ P(jogador marca) × P(é o primeiro | marca) — correlacionado com ordem de gols e ritmo inicial.

## Como a Bet365 contabiliza

| Situação | Liquidação |
|----------|------------|
| Jogador marca o 1º gol | **GREEN** |
| Outro jogador marca primeiro | **RED** |
| 0-0 final | **RED** (ou VOID em mercados com "No scorer") |
| Gol contra como 1º gol | Regra específica — frequentemente **sem marcador** / RED em todos jogadores |
| Não titular (não entra) | **VOID** — stake devolvido |
| Entra no 2º tempo após 1º gol | **RED** (já havia gol) |
| Partida abandonada 0-0 | **VOID** |

## Exemplo GREEN

**Bayern vs Augsburg** · Aposta: **Harry Kane — Primeiro** @ 4,50  
**15'** Kane abre · **GREEN**

## Exemplo RED

**Bayern vs Augsburg** · Aposta: Kane primeiro @ 4,50  
**22'** Musiala marca primeiro · **RED**

## Exemplo VOID

Kane no banco; não entra em campo → **VOID**

## Mercados relacionados

- Anytime Marcador
- Último Marcador
- Time Marca Primeiro
- Próximo Gol (live)

## Quando utilizar

- Atacante referência com alta taxa de abertura de placar
- Adversário cede gol cedo (xGA 1º tempo alto)
- Casa oferece odd > fair model + 8% EV
- Escalação confirmada

## Quando evitar

- Jogador em dúvida ou minutos limitados
- Jogo fechado (λ total < 2,0)
- Own goal provável (defesa frágil, bolas paradas)
- Odd já comprimida após team news

## Indicadores importantes

| Indicador | Uso |
|-----------|-----|
| gols/90 últimos 10 | Base λ |
| % gols que foram 1º do time | Fator "abridor" |
| xG 1º tempo do time | Ritmo inicial |
| Minutos como titular | VOID risk |
| xGA adversário 1T | Chance de sofrer cedo |

## Perfil ideal

- Liga ofensiva (Bundesliga, Eredivisie)
- Favorito dominante em casa
- Centroavante fixo

## Perfil ruim

- Mata-mata cauteloso
- Chuva / campo pesado
- Rotação confirmada

## Riscos

- Gol contra como primeiro
- Expulsão cedo altera dinâmica
- VAR anula gol — liquidação após decisão final

## Odds médias

| Perfil | Faixa |
|--------|-------|
| Artilheiro favorito | 3,50 – 6,00 |
| Segundo atacante | 6,00 – 12,00 |
| Meia / lateral | 12,00 – 26,00 |
| Zagueiro | 15,00 – 51,00 |

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Titular confirmado
- [ ] ≥ 8 jogos com minutos na amostra
- [ ] Player Engine com `hasModel: true`
- [ ] EV > 8% (mercado volátil)
- [ ] Regra own goal Bet365 verificada
- [ ] Não combinar com mesmo jogador anytime na múltipla (++ correlação)

---

# Último Marcador

## O que é

Aposta no jogador que marca o **último gol** da partida (90 min + acréscimos).

## Como funciona

- Similar ao primeiro marcador, mas sensível a **final de jogo** (cansaço, substituições ofensivas).
- Times perdendo no 85' intensificam ataque — aumenta chance de zagueiro ou reserva marcar.

## Como a Bet365 contabiliza

| Situação | Liquidação |
|----------|------------|
| Jogador marca o último gol | **GREEN** |
| Outro marca depois | **RED** |
| 0-0 | **RED** / VOID conforme mercado |
| Não titular | **VOID** |
| Único gol do jogo | Esse jogador é primeiro **e** último — GREEN em ambos mercados se apostado |

## Exemplo GREEN

**Liverpool 3-2 Tottenham** · Último gol: **Salah 90+2'** · Aposta Salah último @ 5,00 → **GREEN**

## Exemplo RED

Aposta Salah último · Último gol Núñez 88' → **RED**

## Exemplo VOID

Jogador não entra → **VOID**

## Mercados relacionados

- Primeiro Marcador
- Anytime Marcador
- Último Gol (time)

## Quando utilizar

- Jogador "closer" — histórico de gols tardios
- Jogo com favorito pressionando no 2T
- Adversário abre e sofre reação

## Quando evitar

- Jogo decidido cedo com administração
- Time líder com substituições defensivas

## Indicadores importantes

- % gols entre 75'-90+'
- Substitutos ofensivos no banco
- xG 2º tempo
- Histórico vs adversário

## Perfil ideal

- Favorito que sofre e vira
- Artilheiro de penáltis (último gol frequente)

## Perfil ruim

- 0-0 ou 1-0 com controle total

## Riscos

- Gol nos acréscimos por jogador não apostado
- Partida interrompida

## Odds médias

| Perfil | Faixa |
|--------|-------|
| Referência | 4,00 – 7,00 |
| Outros | 8,00 – 21,00 |

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Titular ou entrada provável antes do 60'
- [ ] Perfil de gols tardios na amostra
- [ ] EV positivo vs modelo
- [ ] Evitar correlação com Over alto + mesmo jogador anytime

---

# Anytime Marcador (Qualquer Momento)

> **Playbook de análise:** [analysis/anytime-scorer.md](../analysis/anytime-scorer.md)

## O que é

Aposta em jogador que marca **pelo menos um gol** em qualquer minuto do tempo regulamentar. Mercado mais líquido em props de jogador.

## Como funciona

No **Soccer Analytics Player Engine**:

```
gols/90 = (gols / minutos) × 90
minutos_esperados = média_minutos × fator_titular
λ = (gols/90 / 90) × minutos_esperados × (xG_time / xG_médio_liga)
P(marcar) = 1 - e^(-λ)
```

- Escalação via `/fixtures/lineups` ajusta minutos.
- Sem dados → prob. implícita da odd → **SKIP**.

## Como a Bet365 contabiliza

| Situação | Liquidação |
|----------|------------|
| ≥ 1 gol do jogador | **GREEN** |
| 0 gols | **RED** |
| Não titular (regra "must start") | **VOID** |
| Gol contra | **RED** para jogador que marcou contra |
| Entra como reserva e marca | **GREEN** (se entrou) |
| Partida abandonada | VOID se jogador não marcou; GREEN se já marcou |

## Exemplo GREEN

**Man City vs Wolves** · **Haaland anytime** @ 1,40  
**34'** Haaland · **GREEN**

## Exemplo RED

Haaland anytime @ 1,40 · 0 gols · **RED**

## Exemplo VOID

Regra "jogador deve iniciar" · Haaland no banco 90' → **VOID**

## Mercados relacionados

- Primeiro / Último Marcador
- Marcador 2+ Gols
- Time Marca
- Gols do Jogador (Over 0.5)

## Quando utilizar

- `hasModel: true` no Player Engine
- gols/90 > 0,45 em amostra ≥ 10 jogos
- Adversário xGA > 1,4
- EV > 5% e Score IA ≥ 70

## Quando evitar

- Amostra < 5 jogos com minutos
- Reserva provável
- Adversário elite defensiva (xGA < 0,9)
- Odd < 1,25 sem edge

## Indicadores importantes

| Indicador | Peso |
|-----------|------|
| gols/90 | Alto |
| Minutos médios | Alto |
| xG do time | Médio |
| xGA adversário | Médio |
| Pênaltis cobrados | Médio |
| Lesão recente | Alto (bloqueante) |

## Perfil ideal

- Centroavante titular vs defesa frágil
- Copa com favorito esmagador

## Perfil ruim

- Meio-campista com 0,10 gols/90
- Jogo Under 1.5 esperado

## Riscos

- Saída no 60' sem marcar
- Offside anulado por VAR
- Banco sem entrar (VOID vs RED conforme regra)

## Odds médias

| Perfil | Faixa |
|--------|-------|
| Elite (Kane, Haaland) | 1,30 – 1,65 |
| Bom atacante | 1,80 – 3,00 |
| Meia atacante | 3,00 – 6,00 |
| Defensor / volante | 8,00 – 21,00 |

## Grau de dificuldade

**Alto** (com modelo) · **Muito Alto** (sem modelo)

## Checklist

- [ ] Player Engine: `playerModel: true`
- [ ] Titular em `/fixtures/lineups`
- [ ] EV e Score IA no threshold
- [ ] Comparar P modelo vs 1/odd
- [ ] Ver regra "must start" da Bet365
- [ ] Documentar no snapshot para backtest

---

# Marcador 2+ Gols

## O que é

Aposta em jogador que marca **dois ou mais gols** na mesma partida (tempo regulamentar).

## Como funciona

```
P(2+) ≈ P(2 gols) + P(3+) via Poisson por jogador
ou histórico: freq_brace / jogos
```

Correlaciona fortemente com **vitória folgada** do time do jogador.

## Como a Bet365 contabiliza

| Situação | Liquidação |
|----------|------------|
| 2+ gols do jogador | **GREEN** |
| 0 ou 1 gol | **RED** |
| Hat-trick | **GREEN** (incluído em 2+) |
| Não titular | **VOID** |

## Exemplo GREEN

**Haaland 2+** @ 2,80 · Final **3-0**, Haaland 2 gols → **GREEN**

## Exemplo RED

Haaland 2+ · 1 gol → **RED**

## Exemplo VOID

Não titular → **VOID**

## Mercados relacionados

- Hat-Trick
- Anytime Marcador
- Time Over gols

## Quando utilizar

- λ_time > 2,5 e jogador com > 30% jogos com brace
- Adversário aberto
- Favorito -1.5 handicap alinhado

## Quando evitar

- Jogo equilibrado Under 2.5
- Jogador compartilha pênaltis

## Indicadores importantes

- % jogos com 2+ gols
- xG time
- Média gols em casa vs top 6

## Perfil ideal

- Haaland / Mbappé vs lanterna

## Perfil ruim

- Meia com 1 gol na temporada

## Riscos

- Gol anulado reduz de 2 para 1
- Substituição após 1 gol

## Odds médias

| Perfil | Faixa |
|--------|-------|
| Elite vs fraco | 2,20 – 4,00 |
| Médio | 5,00 – 12,00 |

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Histórico brace rate
- [ ] λ_time compatível
- [ ] Não duplicar com hat-trick na mesma múltipla
- [ ] EV > 10%

---

# Hat-Trick

## O que é

Aposta em jogador que marca **três ou mais gols** na partida (tempo regulamentar).

## Como funciona

Evento raro. P(3+) muito baixa — odds altas, variância extrema.

```
P(hat-trick) ≈ λ^3 / 6 × e^(-λ)  [aproximação Poisson por jogador]
```

## Como a Bet365 contabiliza

| Situação | Liquidação |
|----------|------------|
| 3+ gols do jogador | **GREEN** |
| 0–2 gols | **RED** |
| Não titular | **VOID** |
| 4+ gols | **GREEN** (mesma aposta) |

## Exemplo GREEN

**Haaland hat-trick** @ 12,00 · Gols 12', 56', 78' → **GREEN**

## Exemplo RED

Haaland hat-trick · 2 gols → **RED**

## Exemplo VOID

Lesionado no aquecimento, não joga → **VOID**

## Mercados relacionados

- Marcador 2+ Gols
- Anytime Marcador
- Placar exato 4-0+

## Quando utilizar

- Amostra grande mostra hat-trick 1/15+ e odd > 15
- Adversário com xGA > 2,0 fora
- Apenas stake mínimo (entretenimento + edge marginal)

## Quando evitar

- Quase sempre como aposta principal
- Combinações em múltipla

## Indicadores importantes

- Hat-tricks carreira / últimos 2 anos
- xG team > 2,8
- Jogo sem alternativa tática para adversário

## Perfil ideal

- Favorito 1.20 vs último colocado

## Perfil ruim

- Qualquer jogo equilibrado

## Riscos

- Concentração total em um jogador
- Expulsão do adversário reduz ritmo

## Odds médias

| Perfil | Faixa |
|--------|-------|
| Elite vs fraco | 8,00 – 15,00 |
| Outros | 17,00 – 51,00+ |

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Stake ≤ 0,25% banca
- [ ] EV calculado com cauda Poisson
- [ ] Nunca em acumuladora longa
- [ ] Titular confirmado

---

## Referências

- [06-estatisticas-jogador.md](./06-estatisticas-jogador.md)
- [../ai/indicadores.md](../ai/indicadores.md)
- [../examples/bilhete-jogadores.md](../examples/bilhete-jogadores.md)
- Player Engine: `apps/api/src/engines/player-engine/`
