# 09 — Mercados Asiáticos

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 09  
> **Conceito central:** linhas com .25 / .75 → meio green, meio red, push  
> **Engine:** Analysis Engine — `probabilityHandicapCover()` · `probabilityOverLine()`

## Visão geral

Mercados **asiáticos** eliminam ou reduzem o empate na aposta usando linhas divididas. Metade da stake em duas linhas adjacentes. Comuns em **gols**, **escanteios**, **cartões** e recortes por **tempo**.

### Tipos de resultado asiático

| Resultado | Significado |
|-----------|-------------|
| **GREEN** | Stake ganha integral |
| **RED** | Stake perde integral |
| **PUSH / VOID parcial** | Metade stake devolvida |
| **Half WIN** | Metade ganha, metade push |
| **Half LOSS** | Metade perde, metade push |

### Mercados neste arquivo

| # | Mercado | Dificuldade |
|---|---------|-------------|
| 1 | Handicap Asiático Gols | Médio |
| 2 | Over/Under Asiático Gols | Médio |
| 3 | Handicap Asiático Escanteios | Alto |
| 4 | Over/Under Asiático Escanteios | Alto |
| 5 | Handicap Asiático Cartões | Alto |
| 6 | Over/Under Asiático Cartões | Alto |
| 7 | Handicap Asiático 1º Tempo | Alto |
| 8 | Over/Under Asiático 1º Tempo | Alto |
| 9 | Handicap Asiático 2º Tempo | Alto |
| 10 | Over/Under Asiático 2º Tempo | Alto |

### Soccer Analytics

Handicap gols implementado em `probabilityHandicapCover(matrix, side, line)`.

---

# Handicap Asiático Gols

## O que é

Handicap aplicado ao **placar de gols** — linhas: **0**, **±0.25**, **±0.5**, **±0.75**, **±1**, etc.

## Como funciona

| Linha | Exemplo placar | Resultado Casa |
|-------|----------------|----------------|
| **0.0** | Empate | PUSH (void) |
| **-0.5** | Vitória casa | GREEN |
| **-0.5** | Empate | RED |
| **-0.25** | Empate | **Half LOSS** |
| **-0.25** | Vitória casa 1 gol | **Half WIN** |
| **-0.75** | Vitória 1 gol | **Half WIN** |
| **-0.75** | Vitória 2+ | GREEN |

Stake dividida: -0.25 = metade em 0.0 + metade em -0.5.

## Como a Bet365 contabiliza

Tempo regulamentar. Liquidação conforme tabela asiática padrão.

## Exemplo GREEN

**Casa -0.5** · Final **2-1** → **GREEN** @ 1,90

## Exemplo RED

**Casa -0.5** · **1-1** → **RED**

## Exemplo VOID / PUSH

**Casa 0.0** · **1-1** → **PUSH** (stake devolvido)

## Mercados relacionados

- Handicap Europeu
- Empate Anula (≈ 0.0)
- [01-resultados.md](./01-resultados.md)

## Quando utilizar

- Quer cobertura parcial no empate (0.0, -0.25)
- Modelo Poisson favorece vitória estreita → -0.25 value

## Quando evitar

- Sem entender half win/loss

## Indicadores importantes

- Matriz Poisson placares
- P(cover) por linha

## Perfil ideal

- Favorito estreito (vitória 1 gol provável)

## Perfil ruim

- Zebra ou empate provável sem linha 0.0

## Riscos

- Confusão liquidação
- Empate 1-1 half loss em -0.25

## Odds médias

-0.5: 1,85 – 2,00 · 0.0: 1,75 – 1,90 · -0.25: 1,95 – 2,10

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Entender split stake
- [ ] `probabilityHandicapCover()` no engine
- [ ] EV inclui cenários half

---

# Over/Under Asiático Gols

## O que é

Total gols com linhas **2.25**, **2.75**, **3.25**, etc.

## Como funciona

| Linha | 2 gols | 3 gols |
|-------|--------|--------|
| Over 2.25 | Half LOSS | Half WIN |
| Over 2.5 | RED | GREEN |
| Over 2.75 | RED | Half WIN + push |
| Under 2.25 | Half WIN | Half LOSS |

## Como a Bet365 contabiliza

Metade Over X.0, metade Over X.5 (ou Under equivalente).

## Exemplo GREEN

**Over 2.5** · 3 gols → **GREEN**

## Exemplo RED

**Over 2.5** · 2 gols → **RED**

## Exemplo HALF

**Over 2.25** · 2 gols → **Half LOSS** (metade RED, metade push)

## Mercados relacionados

- Over/Under europeu
- [02-gols.md](./02-gols.md)

## Quando utilizar

- λ ≈ 2,7 → linha 2.75 reduz variância vs 2.5
- Modelo entre duas linhas europeias

## Quando evitar

- Iniciante sem tabela asiática

## Indicadores importantes

- λ Poisson total
- P(2) vs P(3) específicas

## Perfil ideal

- Analista com λ decimal preciso

## Perfil ruim

- Aposta "no feeling"

## Riscos

- Liquidação parcial confunde

## Odds médias

2.25 Over: 1,90 – 2,05

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Simular half outcomes no EV

---

# Handicap Asiático Escanteios

## O que é

Handicap na **diferença de escanteios** com linhas asiáticas.

## Como funciona

Casa -1.25 cantos: metade -1.0 + metade -1.5.

## Como a Bet365 contabiliza

Cantos cobrados; diferença após handicap.

## Exemplo GREEN

**Casa -0.5 cantos** · Casa 8, Fora 6 → **GREEN**

## Exemplo RED

Casa 7, Fora 7 · -0.5 → **RED**

## Exemplo PUSH

**0.0** · Empate cantos → **PUSH**

## Mercados relacionados

- [03-escanteios.md](./03-escanteios.md)

## Quando utilizar

- Dominância cantos esperada
- λ_corners diff > 2

## Quando evitar

- Jogo equilibrado

## Indicadores importantes

- Diff cantos médio
- Posse

## Perfil ideal

- Favorito vs bloco

## Perfil ruim

- Contra-ataque

## Riscos

- Menor liquidez

## Odds médias

1,85 – 2,05

## Grau de dificuldade

**Alto**

## Checklist

- [ ] λ cantos calibrado

---

# Over/Under Asiático Escanteios

## O que é

Total cantos linhas **10.25**, **10.75**, etc.

## Como funciona

Idêntico a gols asiático com λ_corners.

## Como a Bet365 contabiliza

Split stake padrão.

## Exemplo GREEN

**Over 10.5** · 11 cantos → **GREEN**

## Exemplo HALF

**Over 10.25** · 10 cantos → **Half LOSS**

## Exemplo RED

**Over 10.5** · 10 → **RED**

## Mercados relacionados

- Total Escanteios

## Quando utilizar

- λ ≈ 10,8

## Quando evitar

- Dados cantos fracos

## Indicadores importantes

- λ_corners Poisson

## Perfil ideal

- PL alta cantos

## Perfil ruim

- Jogo fechado

## Riscos

- Variância cantos

## Odds médias

1,88 – 2,02

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Poisson λ cantos

---

# Handicap Asiático Cartões

## O que é

Handicap diferença **cartões** linha asiática.

## Como funciona

Casa -0.5 cartões: casa precisa receber menos cartões que fora + 0.5.

## Como a Bet365 contabiliza

Cartões amarelos + vermelhos contados.

## Exemplo GREEN

Casa 2 cartões, Fora 4 · Casa -0.5 → **GREEN**

## Exemplo RED

Casa 3, Fora 3 · -0.5 → **RED**

## Exemplo PUSH

0.0 · empate → **PUSH**

## Mercados relacionados

- [04-cartoes-faltas.md](./04-cartoes-faltas.md)

## Quando utilizar

- Time mais disciplinado vs agressivo

## Quando evitar

- Árbitro homogêneo

## Indicadores importantes

- Diff cartões
- Árbitro

## Perfil ideal

- Técnico vs destroyer

## Perfil ruim

- Derby equilibrado

## Riscos

- Cartão 90+ muda

## Odds médias

1,85 – 2,10

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Árbitro consultado

---

# Over/Under Asiático Cartões

## O que é

Total cartões **4.25**, **4.75**, etc.

## Como funciona

Poisson λ_cards.

## Como a Bet365 contabiliza

Split asiático.

## Exemplo GREEN

**Over 4.5** · 5 cartões → **GREEN**

## Exemplo HALF

**Over 4.25** · 4 cartões → **Half LOSS**

## Exemplo RED

**Over 4.5** · 4 → **RED**

## Mercados relacionados

- Total Cartões

## Quando utilizar

- Derby + árbitro rigoroso
- λ ≈ 4,7

## Quando evitar

- Amistoso

## Indicadores importantes

- λ_cards + árbitro

## Perfil ideal

- Clássico tenso

## Perfil ruim

- Permissivo

## Riscos

- Vermelho imprevisível

## Odds médias

1,88 – 2,05

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Ajuste árbitro em λ

---

# Handicap Asiático 1º Tempo

## O que é

Handicap **gols** aplicado **somente ao placar do 1T**.

## Como funciona

Casa -0.25 HT: metade 0.0 HT + metade -0.5 HT.

## Como a Bet365 contabiliza

Placar intervalo apenas.

## Exemplo GREEN

HT 1-0 · Casa -0.5 HT → **GREEN**

## Exemplo RED

HT 0-0 · Casa -0.5 HT → **RED**

## Exemplo PUSH

HT 0-0 · Casa 0.0 HT → **PUSH**

## Mercados relacionados

- [08-primeiro-segundo-tempo.md](./08-primeiro-segundo-tempo.md)
- Handicap FT

## Quando utilizar

- Favorito início forte
- λ_HT favorece

## Quando evitar

- Jogo fechado HT

## Indicadores importantes

- xG 1T
- % lidera HT

## Perfil ideal

- Pressing alto início

## Perfil ruim

- Mata-mata

## Riscos

- Amostra HT menor

## Odds médias

1,90 – 2,15

## Grau de dificuldade

**Alto**

## Checklist

- [ ] f_HT calibrado

---

# Over/Under Asiático 1º Tempo

## O que é

Total gols **1T** linhas **0.75**, **1.25**, etc.

## Como funciona

λ_HT Poisson.

## Como a Bet365 contabiliza

Gols até intervalo.

## Exemplo GREEN

**Over 0.5 HT** · HT 1-0 → **GREEN**

## Exemplo HALF

**Over 0.75 HT** · 0 gols HT → **Half LOSS**

## Exemplo RED

**Over 1.5 HT** · 1 gol HT → **RED**

## Mercados relacionados

- Gols 1T O/U europeu

## Quando utilizar

- λ_HT > 0,9
- Over 0.75 vs 0.5 europeu

## Quando evitar

- 0-0 HT habitual

## Indicadores importantes

- Over 0.5 HT %

## Perfil ideal

- Jogo aberto início

## Perfil ruim

- Fechado

## Riscos

- Um gol decide half

## Odds médias

0.75 Over: 1,45 – 1,60

## Grau de dificuldade

**Alto**

## Checklist

- [ ] λ_HT

---

# Handicap Asiático 2º Tempo

## O que é

Handicap gols **somente 2T**.

## Como funciona

Placar virtual 2T = FT − HT com handicap.

## Como a Bet365 contabiliza

Gols após intervalo.

## Exemplo GREEN

HT 0-0, FT 2-0 → 2T 2-0 · Casa -0.5 2T → **GREEN**

## Exemplo RED

HT 1-0, FT 1-0 → 2T 0-0 · -0.5 → **RED**

## Exemplo PUSH

Empate 2T · linha 0.0 → **PUSH**

## Mercados relacionados

- Resultado 2T
- Handicap FT

## Quando utilizar

- Reação 2T esperada

## Quando evitar

- Administração

## Indicadores importantes

- Gols 2T
- Subs

## Perfil ideal

- Favorito perdendo HT

## Perfil ruim

- 3-0 HT

## Riscos

- Cálculo 2T confuso

## Odds médias

1,90 – 2,15

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Stats 2T

---

# Over/Under Asiático 2º Tempo

## O que é

Total gols **2T** linhas asiáticas **1.25**, **1.75**, etc.

## Como funciona

λ_2T Poisson.

## Como a Bet365 contabiliza

Gols pós-intervalo.

## Exemplo GREEN

HT 0-0, FT 2-1 → 3 gols 2T · Over 1.5 2T → **GREEN**

## Exemplo HALF

Over 1.25 2T · 1 gol 2T → **Half LOSS**

## Exemplo RED

Over 1.5 2T · 1 gol → **RED**

## Mercados relacionados

- Gols 2T O/U

## Quando utilizar

- λ_2T > 1,4
- 0-0 HT + jogo abre 2T

## Quando evitar

- Líder fecha

## Indicadores importantes

- λ_2T
- Padrão 0-0 HT

## Perfil ideal

- Second half open

## Perfil ruim

- Controle

## Riscos

- Depende HT

## Odds médias

1.25 Over 2T: 1,50 – 1,70

## Grau de dificuldade

**Alto**

## Checklist

- [ ] λ_2T calculado

---

## Tabela resumo — Handicap asiático gols

| Placar | Casa -0.5 | Casa -0.25 | Casa 0.0 | Casa +0.5 |
|--------|-----------|------------|----------|-----------|
| Vitória 2+ | GREEN | GREEN | GREEN | GREEN |
| Vitória 1 | GREEN | Half WIN | GREEN | GREEN |
| Empate | RED | Half LOSS | PUSH | GREEN |
| Derrota 1 | RED | RED | RED | Half WIN |
| Derrota 2+ | RED | RED | RED | RED |

---

## Referências

- `probabilityHandicapCover()` — Analysis Engine
- [01-resultados.md](./01-resultados.md) — Handicap Europeu
- [03-escanteios.md](./03-escanteios.md) · [04-cartoes-faltas.md](./04-cartoes-faltas.md)
