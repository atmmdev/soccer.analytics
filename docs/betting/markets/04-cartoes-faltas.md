# 04 — Cartões e Faltas

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 04  
> **Liquidação padrão:** 90 minutos + acréscimos  
> **Engine:** Analysis Engine (Poisson O/U para totais)

## Visão geral

Mercados de **disciplina** (cartões amarelos e vermelhos) e **infrações** (faltas). Cartões contam para totais: amarelo = 1, vermelho = 1 (direto ou 2º amarelo). Correlacionam com **derby**, árbitro, stakes e intensidade — menos com gols, mais com contexto emocional.

### Mercados neste arquivo

| # | Mercado | Dificuldade |
|---|---------|-------------|
| 1 | Total Cartões | Médio |
| 2 | Cartões Por Time | Médio |
| 3 | Primeiro Cartão | Alto |
| 4 | Último Cartão | Alto |
| 5 | Jogador Recebe Cartão | Alto |
| 6 | Cartão Vermelho no Jogo | Muito Alto |
| 7 | Ambos Recebem Cartão | Médio |
| 8 | Handicap Cartões | Médio |
| 9 | Cartões Asiáticos | Médio |
| 10 | Total Faltas | Alto |

### Modelo Soccer Analytics

```
λ_cards = max(0.5, home.avgCards + away.avgCards)
P(Over L) via Poisson (Analysis Engine)
```

Ajuste manual: árbitro +15–25% λ se média cartões/jogo > 5.

---

# Total Cartões

## O que é

Over/Under no **número total de cartões** (amarelos + vermelhos) de ambos os times.

## Como funciona

| Cartão | Pontos no total |
|--------|-----------------|
| Amarelo | 1 |
| Vermelho direto | 1 |
| 2º amarelo → vermelho | 1 amarelo + 1 vermelho = **2** no total Bet365 |

Linhas típicas: **3.5**, **4.5**, **5.5** cartões.

## Como a Bet365 contabiliza

- Cartões mostrados a **jogadores em campo** e **banco** (segundo amarelo) conforme regra Opta.
- Cartão para **comissão técnica** pode contar em mercados específicos — total geral geralmente **jogadores**.
- Acréscimos **contam**.
- Prorrogação **não** conta.

**GREEN Over 4.5:** 5+ cartões

## Exemplo GREEN

**Atlético vs Sevilla** · 3 amarelos + 1 vermelho = **5** · **Over 4.5** @ 1,95 → **GREEN**

## Exemplo RED

**4 cartões** · Over 4.5 → **RED**

## Exemplo VOID

Jogo cancelado → **VOID**

## Mercados relacionados

- Cartões Por Time
- Jogador Recebe Cartão
- Total Faltas
- Cartões Asiáticos

## Quando utilizar

- Derby / rivalidade alta
- Árbitro com média > 5 cartões/jogo
- Mata-mata tenso; rebaixamento
- λ modelo > linha + edge

## Quando evitar

- Amistoso verão
- Árbitro permissivo (< 3 cartões/jogo)
- Times já classificados sem stakes

## Indicadores importantes

| Indicador | Peso |
|-----------|------|
| Cartões/jogo (10j) | Alto |
| Árbitro média | **Muito alto** |
| Faltas/jogo | Médio |
| Derby | Alto |
| Importância jogo | Médio |
| Clima quente | Médio |

## Perfil ideal

- La Liga derby, PL grande rivalidade
- Árbitro conhecido por cartões

## Perfil ruim

- Amistoso pré-temporada

## Riscos

- Árbitro muda estilo no 2T
- VAR evita cartão

## Odds médias

| Linha | Over |
|-------|------|
| 3.5 | 1,80 – 1,95 |
| 4.5 | 1,85 – 2,00 |
| 5.5 | 1,90 – 2,05 |

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Árbitro designado e média consultada
- [ ] λ_cards no Analysis Engine
- [ ] EV > 5%
- [ ] Contexto derby/mata-mata

---

# Cartões Por Time

## O que é

Over/Under de cartões **de um time** (ex.: Roma Over 2.5 cartões).

## Como funciona

Contam apenas cartões recebidos por jogadores daquele time (inclui vermelho).

## Como a Bet365 contabiliza

Mesmas regras de contagem por time. Comissão técnica separada se mercado específico.

## Exemplo GREEN

**Roma Over 2.5** · Roma **3** amarelos → **GREEN**

## Exemplo RED

Roma **2** cartões → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Total Cartões
- Handicap Cartões
- Jogador Recebe Cartão

## Quando utilizar

- Time agressivo / muitas faltas táticas
- Adversário provoca, jogo quente
- Visitante sob pressão faltoso

## Quando evitar

- Time disciplinado (≤ 1.5 cartões/jogo)

## Indicadores importantes

- Cartões casa/fora split
- Faltas cometidas
- Posição tática (volantes)

## Perfil ideal

- Atletico-style pressing agressivo

## Perfil ruim

- Possession team calma

## Riscos

- Árbitro perdão early → RED Under

## Odds médias

1,85 – 2,10

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Split cartões time ≥ 10 jogos
- [ ] Árbitro compatível

---

# Primeiro Cartão

## O que é

Aposta em **qual time recebe o primeiro cartão** (ou qual jogador em mercados estendidos).

## Como funciona

Vence quem **receber** o primeiro cartão (amarelo ou vermelho).

## Como a Bet365 contabiliza

Primeiro cartão **mostrado** pelo árbitro. Cartão rescindido por VAR — liquidação após decisão final.

## Exemplo GREEN

Aposta **Casa primeiro cartão** · 12' amarelo casa → **GREEN** @ 1,85

## Exemplo RED

Visitante cartão 8' → **RED**

## Exemplo VOID

0 cartões no jogo → regras

## Mercados relacionados

- Último Cartão
- Jogador Recebe Cartão
- Primeiro Escanteio (correlação fraca)

## Quando utilizar

- Derby com histórico cartão cedo
- Árbitro rigoroso início

## Quando evitar

- Árbitro permissivo 1T

## Indicadores importantes

- % primeiro cartão casa
- Faltas 0-15'

## Perfil ideal

- Clássico tenso

## Perfil ruim

- Jogo amistoso

## Riscos

- VAR adia cartão

## Odds médias

1,75 – 2,10

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Histórico início
- [ ] Stake reduzido

---

# Último Cartão

## O que é

Qual time recebe o **último cartão** do tempo regulamentar.

## Como funciona

Útil em jogos tensos com faltas táticas no final.

## Como a Bet365 contabiliza

Último cartão antes do apito final (+ acréscimos).

## Exemplo GREEN

**Visitante último cartão** · 90+3' → **GREEN**

## Exemplo RED

Casa último → **RED**

## Exemplo VOID

0 cartões → regras

## Mercados relacionados

- Primeiro Cartão
- Over cartões 2T

## Quando utilizar

- Time perdendo comete faltas tardias
- Derby com cartões 2T

## Quando evitar

- Jogo controlado

## Indicadores importantes

- Cartões 75-90+'
- Cartões quando perdendo

## Perfil ideal

- Mata-mata emocionante

## Perfil ruim

- 3-0 administrado

## Riscos

- Árbitro não cartões no final

## Odds médias

1,80 – 2,15

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Padrão 2T documentado

---

# Jogador Recebe Cartão

## O que é

Aposta em jogador específico **receber cartão** (amarelo ou vermelho) durante a partida.

## Como funciona

- **Sim** se jogador recebe ≥ 1 cartão.
- Volantes / zagueiros / "destruidores" — targets comuns.
- Odds por jogador listadas.

## Como a Bet365 contabiliza

| Situação | Liquidação |
|----------|------------|
| Amarelo ou vermelho | **GREEN** |
| Não entra em campo | **VOID** |
| Entra reserva sem cartão | **RED** |
| Cartão para banco (não jogador) | **RED** no prop jogador |

## Exemplo GREEN

**Casemiro recebe cartão** @ 2,10 · 34' amarelo → **GREEN**

## Exemplo RED

Sem cartão → **RED**

## Exemplo VOID

Lesionado, não entra → **VOID**

## Mercados relacionados

- Cartão Vermelho
- Total Cartões
- Faltas jogador

## Quando utilizar

- Jogador média > 0,4 cartões/jogo
- Árbitro rigoroso
- Adversário dribladores (faltas táticas)
- EV vs histórico

## Quando evitar

- Jogador disciplinado
- Árbitro permissivo
- Jogador reserva provável

## Indicadores importantes

- Cartões/jogo jogador
- Faltas cometidas/jogo
- Árbitro
- Posição (DM, CB)

## Perfil ideal

- Casemiro, Felipe Melo type vs dribladores

## Perfil ruim

- Atacante que não marca falta

## Riscos

- Jogador substituído cedo sem cartão
- VAR não mostra cartão

## Odds médias

| Perfil | Faixa |
|--------|-------|
| Cartão-fácil | 1,80 – 2,50 |
| Médio | 3,00 – 5,00 |
| Raro | 6,00+ |

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Titular confirmado
- [ ] Média cartões ≥ 8 jogos
- [ ] Árbitro consultado
- [ ] Regra VOID "must play"

---

# Cartão Vermelho no Jogo

## O que é

Aposta **Sim/Não** se haverá **pelo menos um cartão vermelho** na partida.

## Como funciona

- **Sim:** qualquer vermelho (direto ou 2º amarelo).
- Alta variância; odds Sim típicas 3,00–5,00.

## Como a Bet365 contabiliza

Qualquer vermelho a jogador em campo conta. Vermelho comissão técnica — ver mercado específico.

## Exemplo GREEN

**Sim vermelho** @ 4,00 · 67' expulsão → **GREEN**

## Exemplo RED

Só amarelos → **RED**

## Exemplo VOID

Abandono antes vermelho → VOID

## Mercados relacionados

- Total Cartões Over alto
- Jogador Recebe Cartão
- Derby markets

## Quando utilizar

- Derby histórico expulsões
- Árbitro expulsivo
- Jogo decisivo tenso

## Quando evitar

- Amistoso / árbitro permissivo

## Indicadores importantes

- % jogos com vermelho (10j)
- Árbitro vermelhos/jogo
- Rivalidade

## Perfil ideal

- Derby caliente

## Perfil ruim

- Bundesliga disciplinada média

## Riscos

- Variância extrema

## Odds médias

Sim: 3,50 – 5,50 · Não: 1,15 – 1,25

## Grau de dificuldade

**Muito Alto**

## Checklist

- [ ] Stake ≤ 0,5%
- [ ] Frequência histórica vermelho > implícita

---

# Ambos Recebem Cartão

## O que é

Aposta se **ambos os times** recebem **pelo menos um cartão** cada (BTTS equivalente para cartões).

## Como funciona

- **Sim:** time A ≥ 1 cartão E time B ≥ 1 cartão.
- **Não:** pelo menos um time sem cartão.

## Como a Bet365 contabiliza

Cartões a jogadores de cada time. Time sem cartão = Não ganha.

## Exemplo GREEN

**Sim** · Casa 2, Fora 1 cartão → **GREEN** @ 1,75

## Exemplo RED

Casa 3, Fora 0 → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Total Cartões
- BTTS (correlação fraca +)

## Quando utilizar

- Jogo equilibrado tenso
- Ambos média cartões > 1,8/jogo
- Derby

## Quando evitar

- Favorito domina sem resposta

## Indicadores importantes

- Cartões médios cada time
- Árbitro

## Perfil ideal

- Rivalidade equilibrada

## Perfil ruim

- Favorito 3-0 sem reação

## Riscos

- Um time ultra-disciplinado

## Odds médias

Sim: 1,70 – 2,00 · Não: 1,80 – 2,10

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Ambos times média cartões > 1,5
- [ ] Árbitro não ultra-permissivo

---

# Handicap Cartões

## O que é

Handicap na **diferença de cartões** entre times (ex.: Casa -1.5 cartões).

## Como funciona

```
Casa -1.5: cartões_casa - 1.5 > cartões_fora → GREEN
```

## Como a Bet365 contabiliza

Diferença após handicap. Linhas .5 ou asiáticas.

## Exemplo GREEN

**Casa -1.5** · Casa 4, Fora 2 → 2.5 > 2 → **GREEN**

## Exemplo RED

Casa 3, Fora 2 → 1.5 < 2 → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Cartões Por Time
- Handicap gols

## Quando utilizar

- Time mais agressivo / provocador esperado
- Visitante joga sujo histórico

## Quando evitar

- Árbitro trata igual

## Indicadores importantes

- Diferença média cartões
- Estilo jogo

## Perfil ideal

- Casa agressiva vs visitante técnico

## Perfil ruim

- Árbitro homogêneo

## Riscos

- Cartões concentrados um time só

## Odds médias

1,85 – 2,10

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Diferença histórica ≥ 10 jogos

---

# Cartões Asiáticos

## O que é

Total cartões com **linhas asiáticas** (.25 / .75) — meio green/red/push.

## Como funciona

Idêntico a escanteios asiáticos aplicado a λ cartões.

| Linha | 4 cartões | 5 cartões |
|-------|-----------|-----------|
| Over 4.25 | Meio RED | Meio GREEN + push |
| Over 4.5 | RED | GREEN |

## Como a Bet365 contabiliza

Split stake conforme tabela asiática.

## Exemplo GREEN

**Over 4.5** · 5 cartões → **GREEN**

## Exemplo RED

4 cartões · Over 4.5 → **RED**

## Exemplo PUSH

Over 4.0 · exatamente 4 → push (se linha existir)

## Mercados relacionados

- Total Cartões
- [09-mercados-asiaticos.md](./09-mercados-asiaticos.md)

## Quando utilizar

- Reduzir variância
- λ ≈ 4,7 → linha 4.75

## Quando evitar

- Sem entender meio resultado

## Indicadores importantes

- λ decimal

## Perfil ideal

- Apostador avançado

## Perfil ruim

- Iniciante

## Riscos

- Confusão liquidação

## Odds médias

1,88 – 2,02

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Entender split stake asiático

---

# Total Faltas

## O que é

Over/Under no **número total de faltas** marcadas pelo árbitro (ambos times).

## Como funciona

- Faltas ≠ cartões (nem toda falta é cartão).
- Linhas típicas: **20.5**, **22.5**, **24.5** faltas.
- Dados via Opta; disponibilidade Bet365 varia por competição.

## Como a Bet365 contabiliza

Faltas sancionadas pelo árbitro principal. Faltas não marcadas (vantagem) — critério Opta.

## Exemplo GREEN

**Over 22.5 faltas** · 25 faltas → **GREEN** @ 1,90

## Exemplo RED

22 faltas → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Total Cartões (correlação +)
- Cartões Por Time

## Quando utilizar

- Árbitro marca muitas faltas
- Jogo físico (Premier League, Serie A)
- Derby sem necessariamente muitos cartões

## Quando evitar

- La Liga técnica permissiva
- Árbitro deixa jogar

## Indicadores importantes

- Faltas/jogo árbitro
- Faltas/jogo times
- Estilo (pressing vs posse)

## Perfil ideal

- PL física, árbitro rigoroso em faltas

## Perfil ruim

- Tiki-taka permissivo

## Riscos

- Dados faltas menos disponíveis que cartões
- Liquidez baixa

## Odds médias

1,85 – 2,05

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Fonte dados faltas confirmada
- [ ] Árbitro média faltas > linha
- [ ] Roadmap Statistics Engine (importação)

---

## Tabela árbitro (ajuste λ)

| Média cartões/jogo árbitro | Ajuste λ |
|----------------------------|----------|
| < 3,5 | -15% |
| 3,5 – 4,5 | baseline |
| 4,5 – 5,5 | +10% |
| > 5,5 | +20% |

---

## Referências

- Analysis Engine: `probabilityOverLine()` para cartões
- [../ai/indicadores.md](../ai/indicadores.md) — árbitro
- [09-mercados-asiaticos.md](./09-mercados-asiaticos.md)
- `avgCards` em Statistics Engine
