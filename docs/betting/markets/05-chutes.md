# 05 — Chutes e Finalizações

> **Módulo:** Soccer Analytics · Betting · **Categoria:** 05  
> **Liquidação padrão:** 90 minutos + acréscimos  
> **Provedor de dados:** Opta / Stats Perform (critério Bet365)

## Visão geral

Mercados baseados em **volume e qualidade ofensiva**: finalizações totais, no gol (SOT), fora, bloqueadas, por time, cabeçadas, fora da área e por tempo. Correlacionam fortemente com **xG**, escanteios e pressão — úteis quando o modelo de gols está equilibrado mas há edge no volume.

### Mercados neste arquivo

| # | Mercado | Engine | Dificuldade |
|---|---------|--------|-------------|
| 1 | Total Finalizações (Shots) | Statistics (roadmap) | Médio |
| 2 | Chutes no Gol (SOT) | Statistics (roadmap) | Médio |
| 3 | Chutes Fora do Gol | Statistics (roadmap) | Alto |
| 4 | Chutes Bloqueados | Statistics (roadmap) | Alto |
| 5 | Finalizações Por Time | Statistics (roadmap) | Médio |
| 6 | Cabeçadas ao Gol | Statistics (roadmap) | Alto |
| 7 | Chutes Fora da Área | Statistics (roadmap) | Alto |
| 8 | Finalizações Por Tempo | Statistics (roadmap) | Alto |

### Integração Soccer Analytics

Dados importados via `MatchStatistics` (API-Football): `homeShots`, `awayShots`, `homeShotsOnTarget`, `awayShotsOnTarget`.

```
λ_shots ≈ média(homeShots + awayShots) ajustada por posse e xG
P(Over L) via Poisson ou distribuição empírica
Correlação: + com escanteios, + com xG, + com Over gols
```

**Status:** mercados documentados; modelagem EV+ em **roadmap** do Statistics Engine.

---

# Total Finalizações (Shots)

## O que é

Aposta **Over/Under** (ou linhas alternativas) no **número total de finalizações** de ambos os times somadas, no tempo regulamentar.

## Como funciona

- Linha típica: **Over/Under 22.5**, **24.5**, **26.5** finalizações.
- Cada tentativa de gol que atende critério Opta conta (inclui bloqueios que iam ao gol, fora, SOT).
- **Definição Opta:** tentativa de gol com intenção de marcar; cruzamentos bloqueados podem não contar.

## Como a Bet365 contabiliza

| Evento | Conta? |
|--------|--------|
| Chute no gol | Sim |
| Chute fora | Sim |
| Chute bloqueado | Sim (se foi tentativa de gol) |
| Cruzamento bloqueado | Geralmente **não** |
| Gol anulado por VAR | Conta se foi registrado antes da anulação (regra pode variar) |
| Prorrogação | **Não** |
| Partida abandonada | VOID se < 90 min |

**GREEN Over 24.5:** 25+ finalizações · **RED:** ≤ 24

## Exemplo GREEN

**Arsenal 2-1 Chelsea** · Stats: Arsenal 14 + Chelsea 12 = **26** · **Over 24.5** @ 1,90 → **GREEN**

## Exemplo RED

Total **23** finalizações · **Over 24.5** → **RED**

## Exemplo VOID

Jogo cancelado antes dos 90 min → **VOID**

## Mercados relacionados

- Chutes no Gol (SOT)
- Chutes Bloqueados
- Escanteios Over
- Over gols

## Quando utilizar

- Favorito pressionando vs bloco baixo (muitos chutes, poucos gols)
- xG alto mas conversão baixa recente (regressão à média em gols, não necessariamente em chutes)
- Média combinada > linha + 1,5 nos últimos 10 jogos

## Quando evitar

- Jogo com time já classificado (rotação, ritmo baixo)
- Adversário com posse extrema sem verticalidade
- Chuva forte (menos chutes de longe)

## Indicadores importantes

| Indicador | Uso |
|-----------|-----|
| Shots/jogo (10j) | Base λ |
| xG vs gols (conversão) | Contexto |
| Posse % | Volume |
| PPDA adversário | Pressão |
| Escanteios médios | Correlação + |
| Estilo (cruzamentos vs meio) | Tipo de chute |

## Perfil ideal

- Premier League / Bundesliga — alto volume
- Favorito em casa vs defesa reativa

## Perfil ruim

- Serie A fechada 0-0
- Amistoso verão

## Riscos

- Critério Opta vs transmissão (discordância)
- VAR anula sequência ofensiva
- Time líder recua no 2T

## Odds médias

| Linha | Over típico |
|-------|-------------|
| 22.5 | 1,85 – 2,00 |
| 24.5 | 1,90 – 2,05 |
| 26.5 | 1,95 – 2,10 |

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Média shots combinada ≥ 10 jogos
- [ ] Escalações ofensivas confirmadas
- [ ] Comparar linha vs média + desvio
- [ ] Verificar correlação com Over gols na múltipla
- [ ] EV > 5% se modelado

---

# Chutes no Gol (SOT — Shots on Target)

## O que é

Over/Under no total de **finalizações no alvo** (forçariam gol se não fossem defendidas/bloqueadas na linha).

## Como funciona

- SOT ⊆ total shots; taxa típica **30–40%** SOT/shots.
- Melhor preditor de gols que shots totais.
- λ_SOT ≈ λ_shots × taxa_SOT_histórica.

## Como a Bet365 contabiliza

| Conta como SOT | Não conta |
|----------------|-----------|
| Defesa do goleiro | Chute claramente fora |
| Gol (entrou) | Trave sem rebote perigoso (regra Opta) |
| Bloqueio na linha indo ao gol | |

**GREEN Over 8.5 SOT:** 9+ no jogo.

## Exemplo GREEN

**Man City vs Burnley** · 11 SOT total · **Over 8.5** @ 1,85 → **GREEN**

## Exemplo RED

**7 SOT** · Over 8.5 → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Total Finalizações
- Over gols
- Defesas do goleiro
- xG

## Quando utilizar

- xG alto + conversão baixa (SOT mantém, gols podem subir depois)
- Goleiro adversário xSV alto (muitos SOT, poucos gols — cuidado com Over **gols**)

## Quando evitar

- Time só chuta de longe (shots altos, SOT baixo)
- Bloqueio baixo adversário sem SOT

## Indicadores importantes

- SOT/jogo, SOT%
- xG
- Saves goleiro
- Chutes dentro da área

## Perfil ideal

- Jogo com favorito dominante
- Adversário concede SOT

## Perfil ruim

- Chutes só de meia distância

## Riscos

- Definição SOT varia levemente por provedor

## Odds médias

| Linha | Faixa |
|-------|-------|
| 7.5 | 1,80 – 1,95 |
| 8.5 | 1,85 – 2,00 |
| 9.5 | 1,90 – 2,05 |

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Taxa SOT% estável
- [ ] xG alinhado com SOT esperado
- [ ] Não duplicar Over 2.5 + Over SOT sem edge conjunto

---

# Chutes Fora do Gol

## O que é

Over/Under em finalizações **fora do alvo** (wide, over, post without goal per Opta).

## Como funciona

```
Chutes fora ≈ Total shots - SOT - blocked (depende agregação casa)
```

Mercado de nicho; maior variância.

## Como a Bet365 contabiliza

Conta tentativas que **não** são SOT nem bloqueio (conforme feed Opta).

## Exemplo GREEN

**Over 10.5 chutes fora** · Total 12 → **GREEN**

## Exemplo RED

Total 9 → **RED**

## Exemplo VOID

Jogo cancelado → **VOID**

## Mercados relacionados

- Total Finalizações
- SOT
- Chutes Fora da Área

## Quando utilizar

- Times com muitos chutes de meia distância
- Adversário bloco baixo (desvios fora)

## Quando evitar

- Jogo Under gols esperado com pouco volume

## Indicadores importantes

- % chutes fora / total
- Distância média chute

## Perfil ideal

- Bundesliga, PL com meias chutadores

## Perfil ruim

- Jogo tático 0-0

## Riscos

- Alta variância
- Liquidez baixa

## Odds médias

1,85 – 2,10

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Amostra ≥ 15 jogos
- [ ] Stake reduzido

---

# Chutes Bloqueados

## O que é

Over/Under em **finalizações bloqueadas** por defensor antes de chegar ao gol.

## Como funciona

Correlaciona com **pressão ofensiva** e defesas compactas. Favorito dominante vs bloco → Over blocked.

## Como a Bet365 contabiliza

Bloqueio por defensor de chute com intenção de gol. Desvios de cruzamento podem ser classificados diferente.

## Exemplo GREEN

**Liverpool vs Burnley** · 9 bloqueios · **Over 7.5** @ 1,95 → **GREEN**

## Exemplo RED

6 bloqueios · Over 7.5 → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Escanteios (rebote blocked → corner)
- Total Shots
- SOT

## Quando utilizar

- Favorito vs defesa low block
- xG alto, gols baixos (pressão sem conversão)

## Quando evitar

- Jogo aberto end-to-end

## Indicadores importantes

- Blocked shots/jogo
- Escanteios
- Posse na terça final

## Perfil ideal

- City/Liverpool vs 5-4-1

## Perfil ruim

- Contra-ataque puro

## Riscos

- Classificação Opta inconsistente em edge cases

## Odds médias

1,85 – 2,15

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Estilo adversário confirmado (bloco)
- [ ] Correlação ++ com escanteios — evitar duplicar na múltipla

---

# Finalizações Por Time

## O que é

Over/Under de **finalizações de um time específico** (ex.: Arsenal Over 14.5 shots).

## Como funciona

Apenas chutes do time selecionado contam. Visitante pode ter linha menor.

## Como a Bet365 contabiliza

Mesmas regras Opta por time. Não inclui chutes do adversário.

## Exemplo GREEN

**Arsenal Over 13.5 shots** · Arsenal 16 → **GREEN**

## Exemplo RED

Arsenal 11 → **RED**

## Exemplo VOID

Abandono → **VOID**

## Mercados relacionados

- Total shots jogo
- Handicap shots (raro)
- Time Over gols

## Quando utilizar

- Favorito em casa com monólogo ofensivo
- Visitante cede muitos chutes (xGA alto)

## Quando evitar

- Visitante com posse e adversário no bloco

## Indicadores importantes

- Shots casa/fora split
- xG team
- Oponente shots allowed

## Perfil ideal

- Casa dominante

## Perfil ruim

- Fora em bloco

## Riscos

- Administração no 2T reduz volume

## Odds médias

1,80 – 2,05

## Grau de dificuldade

**Médio**

## Checklist

- [ ] Split casa/fora ≥ 10 jogos
- [ ] Oponente permite volume histórico

---

# Cabeçadas ao Gol (Headed Shots on Target)

## O que é

Over/Under em **cabeçadas no alvo** (total ou por time, conforme mercado Bet365).

## Como funciona

Subconjunto de SOT. Times com jogo aéreo (centroavantes altos, cruzamentos) → λ alto.

## Como a Bet365 contabiliza

Cabeçada direcionada ao gol que seria gol ou defesa. Cabeçada fora não conta.

## Exemplo GREEN

**Over 2.5 cabeçadas SOT** · 4 → **GREEN**

## Exemplo RED

2 → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Escanteios
- Cartões (disputa aérea)
- Gol de cabeça (marcador)

## Quando utilizar

- Times altos, muitos cruzamentos
- Adversário fraco no ar

## Quando evitar

- Jogo pelo meio, sem cruzamentos

## Indicadores importantes

- % gols de cabeça
- Cruzamentos/jogo
- Escanteios

## Perfil ideal

- PL física, muitos corners

## Perfil ruim

- Tiki-taka puro

## Riscos

- Amostra pequena, alta variância

## Odds médias

1,85 – 2,20

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Estilo cruzamento confirmado
- [ ] Linha baixa (2.5) — variância extrema

---

# Chutes Fora da Área

## O que é

Over/Under em finalizações originadas **fora da grande área**.

## Como funciona

Inclui chutes de meia distância. Menor taxa de conversão → correlaciona com shots fora e SOT baixo %.

## Como a Bet365 contabiliza

Posição do chute no momento do disparo (Opta).

## Exemplo GREEN

**Over 8.5 fora da área** · 10 → **GREEN**

## Exemplo RED

7 → **RED**

## Exemplo VOID

Cancelado → **VOID**

## Mercados relacionados

- Chutes fora (off target)
- Gol de fora da área (marcador especial)

## Quando utilizar

- Meias chutadores (De Bruyne type)
- Defesa fechada na área

## Quando evitar

- Times que só entram na área

## Indicadores importantes

- Long shots/jogo
- xG por chute baixo

## Perfil ideal

- PL, Bundesliga

## Perfil ruim

- Serie A baixa linha

## Riscos

- Classificação posição imprecisa em replay

## Odds médias

1,90 – 2,15

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Identificar meias titulares chutadores
- [ ] Não correlacionar com Over gols sem modelo conjunto

---

# Finalizações Por Tempo

## O que é

Over/Under de finalizações no **1º tempo**, **2º tempo** ou comparação entre períodos.

## Como funciona

- **1T shots:** do apito inicial ao fim do acréscimo do 1T.
- **2T:** início 2T ao fim.
- Ritmo: muitos times pressionam mais em um dos períodos.

## Como a Bet365 contabiliza

Divisão exata por período conforme feed ao vivo. Acréscimos contam no período respectivo.

## Exemplo GREEN

**Over 11.5 shots 1T** · 13 no intervalo → **GREEN**

## Exemplo RED

10 no 1T → **RED**

## Exemplo VOID

Abandono no 1T → regras específicas Bet365

## Mercados relacionados

- Gols por tempo
- Escanteios intervalo
- Resultado intervalo

## Quando utilizar

- Histórico claro (ex.: 60% shots no 2T)
- Tática "começar forte" conhecida

## Quando evitar

- Primeiro jogo do técnico

## Indicadores importantes

- Split shots 1T/2T
- Substituições habituais 60'

## Perfil ideal

- Times com pressão alta início

## Perfil ruim

- Jogos equilibrados sem padrão

## Riscos

- Mudança tática no intervalo

## Odds médias

1,85 – 2,10

## Grau de dificuldade

**Alto**

## Checklist

- [ ] Amostra split 1T/2T ≥ 15 jogos
- [ ] Confirmar notícias táticas

---

## Matriz de correlação (Chutes)

|  | Over gols | Escanteios | SOT | Posse |
|--|-----------|------------|-----|-------|
| Total Shots | + | + | ++ | + |
| SOT | ++ | + | — | + |
| Blocked | + | ++ | + | + |

---

## Referências

- [02-gols.md](./02-gols.md) · [03-escanteios.md](./03-escanteios.md)
- [../ai/indicadores.md](../ai/indicadores.md)
- `MatchStatistics` em `apps/api/prisma/schema.prisma`
