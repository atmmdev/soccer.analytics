# Glossário — Apostas Esportivas em Futebol

> Dicionário oficial do módulo Betting · Soccer Analytics  
> Todas as definições em português (Brasil). Odds no formato decimal.

---

## Índice alfabético

[A](#a) · [B](#b) · [C](#c) · [D](#d) · [E](#e) · [F](#f) · [G](#g) · [H](#h) · [I](#i) · [J](#j) · [L](#l) · [M](#m) · [O](#o) · [P](#p) · [R](#r) · [S](#s) · [T](#t) · [V](#v) · [X](#x) · [Z](#z)

---

## A

### Acréscimo / Tempo de acréscimo

Minutos adicionados pelo árbitro ao final de cada tempo (1º e 2º). **Gols, cartões e escanteios em acréscimo contam** para a maioria dos mercados de tempo regulamentar (90 min + acréscimos), salvo mercados que especifiquem apenas "45 minutos" ou "1º tempo sem acréscimo" (raro).

### Acumulador / Múltipla / Parlay

Bilhete com **duas ou mais seleções**. Todas devem ganhar para o bilhete ser GREEN. A odd combinada é o **produto** das odds individuais. Risco cresce exponencialmente com o número de pernas.

### Ambas Marcam (BTTS — Both Teams To Score)

Mercado que pergunta se **os dois times marcam pelo menos um gol** na partida (90 min + acréscimos). Variações: BTTS Sim / BTTS Não; BTTS no 1º tempo; BTTS nos dois tempos.

### Anytime Goal Scorer

Aposta em jogador que marca **pelo menos um gol** em qualquer momento da partida (90 min + acréscimos). Gols contra **não** contam para o jogador adversário na maioria das casas — contam como gol do time beneficiado.

### Arbitragem (Arb)

Situação em que somando probabilidades implícitas de casas diferentes para todos os desfechos de um evento, o total é **menor que 100%**, permitindo lucro garantido. Raro, margens apertadas, casas limitam contas.

### Asian Handicap (Handicap Asiático)

Handicap que elimina o empate como resultado da aposta usando linhas inteiras, .5, .25 e .75. Permite **meio green**, **meio red** ou **push** (devolução). Ver [markets/09-mercados-asiaticos.md](./markets/09-mercados-asiaticos.md).

### Assistência

Passe (ou toque) que leva diretamente a um gol, conforme critério oficial da competição / provedor de dados (Opta, etc.). Relevante para mercados de props de jogador.

### Away (Fora / Visitante)

Time que joga fora de casa. Em mercados 1X2, "2" ou "Away" = vitória do visitante.

---

## B

### Back (Apostar a favor)

Apostar que um evento **vai acontecer** (ex.: Over 2.5, Casa vence). Oposto de Lay em exchanges.

### Bankroll (Banca)

Capital total reservado para apostas. Unidade fundamental para **gestão de risco** e cálculo de stake. No Soccer Analytics, gerenciada no módulo Bankroll.

### Bet (Aposta)

Posição assumida em um mercado com stake definido.

### Bilhete

Conjunto de uma ou mais seleções submetidas em uma única aposta (simples ou múltipla).

### BTTS

Ver [Ambas Marcam](#ambas-marcam-btts--both-teams-to-score).

---

## C

### Cash Out

Função da casa que permite **encerrar a aposta antes do fim** do evento, recebendo valor calculado em tempo real. Pode ser parcial ou total. Valor geralmente favorece a casa.

### Cartão amarelo

Advertência. Conta como **1 cartão** nos mercados de total. Dois amarelos = vermelho: em geral conta **1 amarelo + 1 vermelho** (2 cartões no total para o jogador/time).

### Cartão vermelho

Expulsão. Conta como **1 cartão** (vermelho) nos totais. Cartão vermelho direto = 1 vermelho.

### Casa de apostas / Bookmaker

Operadora que oferece odds e aceita apostas. Ex.: Bet365, Betfair (exchange).

### Chute / Finalização / Shot

Tentativa de gol direcionada ao alvo (definição Opta). Inclui bloqueios que iam em direção ao gol em algumas estatísticas — ver provedor.

### Chute no gol / Shot on Target (SOT)

Finalização que **entraria no gol** se não fosse interceptada pelo goleiro ou defensor na linha. Trave e bola que entra contam.

### Chute fora do gol / Shot off Target

Finalização que não é SOT (para fora, na trave sem entrar em alguns critérios).

### CLV (Closing Line Value)

Métrica que compara a odd em que você apostou com a **odd de fechamento** (última odd antes do kick-off). Apostar com CLV positivo consistente indica edge real a longo prazo.

**Fórmula simplificada:**  
`CLV% = (Odd_apostada / Odd_fechamento - 1) × 100`

### Combinada

Ver [Acumulador](#acumulador--múltipla--parlay).

### Corners

Ver [Escanteios](#escanteios).

---

## D

### Defesa (do goleiro) / Save

Intervenção do goleiro impedindo gol. Mercado de props em algumas casas.

### Desarme / Tackle

Recuperação de bola via contato legal. Estatística de jogador.

### Draw (Empate)

Resultado em que ambos os times terminam com o mesmo número de gols no tempo regulamentar.

### Draw No Bet (DNB / Empate Anula)

Aposta em vitória de um time; se **empatar**, aposta é **VOID** (stake devolvido).

### Dupla Chance (Double Chance)

Cobre **dois dos três** resultados do 1X2: 1X (casa ou empate), 12 (casa ou fora), X2 (empate ou fora).

---

## E

### Edge

Vantagem estatística do apostador sobre a casa. Relacionado a EV positivo.

`Edge ≈ P_real × Odd - 1`

### Empate anula

Ver [Draw No Bet](#draw-no-bet-dnb--empate-anula).

### Escanteio / Corner

Bola concedida quando a bola sai pela linha de fundo após toque de defensor. **Escanteio cobrado** conta; escanteio não cobrado mas concedido pode variar — Bet365 liquida pelo evento oficial.

### EV (Expected Value / Valor Esperado)

Ganho ou perda **esperada** por unidade apostada ao longo de muitas repetições.

`EV = (P_real × Odd) - 1`

| EV | Interpretação |
|----|---------------|
| > 0 | Value bet |
| = 0 | Justo |
| < 0 | Favorável à casa |

### Expected Assists (xA)

Métrica que estima quantas **assistências** um jogador ou time deveria ter com base na qualidade das chances criadas.

### Expected Goals (xG)

Métrica que estima quantos **gols** um time ou jogador deveria ter marcado com base em qualidade, distância e ângulo das finalizações. Escala 0–1+ por chute; soma por partida.

### Expected Saves (xSV / PSxG)

Gols esperados contra o goleiro — mede qualidade dos chutes enfrentados vs gols sofridos.

---

## F

### Favorito

Time ou seleção com **menor odd** (maior probabilidade implícita). Pode ser mandante ou visitante.

### Fair Odd (Odd justa)

Odd sem margem da casa: `Fair Odd = 1 / P_real`.

### Finalizações

Ver [Chute](#chute--finalização--shot).

### Fixture

Partida agendada. No Soccer Analytics, entidade `Match` com `externalId` da API-Football.

### Foul (Falta)

Infração sancionada pelo árbitro. Mercados de faltas totais em algumas casas.

### FT (Full Time)

Tempo regulamentar: 90 minutos + acréscimos de ambos os tempos.

---

## G

### Gestão de banca

Conjunto de regras para definir **stake**, limites de perda, número de apostas e exposição por mercado/competição. Essencial para sobrevivência a longo prazo.

### Green

Aposta **ganha**. Retorno = `Stake × Odd` (lucro líquido = retorno - stake).

### Gol contra (Own Goal)

Gol marcado na própria meta. Conta para o **time adversário** no placar; em mercados de marcador, **não** credita o jogador que marcou contra em "anytime scorer".

---

## H

### Handicap

Ajuste virtual no placar para equilibrar forças. Ver [Handicap Europeu](#handicap-europeu) e [Asian Handicap](#asian-handicap-handicap-asiático).

### Handicap Europeu

Handicap com **três vias** (vitória time A / empate ajustado / vitória time B). Ex.: Casa -1 → precisa vencer por 2+ gols para GREEN na seleção Casa -1.

### Hat-trick

Três gols do mesmo jogador na mesma partida. Mercado específico de marcador.

### HT (Half Time)

Intervalo — fim do 1º tempo (45 min + acréscimo do 1º tempo).

### Home (Casa / Mandante)

Time que joga em seu estádio.

---

## I

### Impedimento / Offside

Infração de posição ilegal. Conta em mercados de impedimentos totais.

### Implied Probability (Probabilidade Implícita)

Probabilidade derivada da odd da casa:

`P_implícita = 1 / Odd`

Não remove a margem (overround) sozinha.

### Intervalo / Final (HT/FT)

Mercado que combina resultado no **intervalo** e no **final** (ex.: Casa/Casa, Empate/Fora).

---

## J

### Juice / Vig / Margem

Ver [Margem da casa](#margem-da-casa--overround--vig).

---

## L

### Lay (Apostar contra)

Apostar que um evento **não acontece** (exchanges). Assume obrigação de pagar se o evento ocorrer.

### Linha (Line)

Valor numérico do mercado (ex.: 2.5 gols, -1.5 handicap, 9.5 escanteios).

### Live / In-Play

Aposta durante a partida. Odds dinâmicas; maior variância e necessidade de latência baixa.

---

## M

### Margem da casa / Overround / Vig

Percentual embutido nas odds para garantir lucro da operadora. Soma das probabilidades implícitas > 100%.

`Margem ≈ Σ(1/Odd_i) - 1`

### Múltipla

Ver [Acumulador](#acumulador--múltipla--parlay).

---

## O

### Odd (Cota)

Multiplicador decimal do stake em caso de GREEN. Odd `2.00` → lucro de 1 unidade por unidade apostada.

### Over

Aposta em que o total **supera** a linha (ex.: Over 2.5 gols = 3+ gols).

### Own Goal

Ver [Gol contra](#gol-contra-own-goal).

### Overround

Ver [Margem da casa](#margem-da-casa--overround--vig).

---

## P

### Passes / Passes certos

Entregas de bola entre jogadores. Props de jogador em casas avançadas.

### Placar exato / Correct Score

Aposta no resultado final preciso (ex.: 2-1).

### Poisson

Distribuição estatística usada no Soccer Analytics para modelar gols, escanteios e cartões.

### Posse de bola

Percentual de tempo com a bola. Mercado de estatística; não determina resultado diretamente.

### PPDA (Passes Allowed Per Defensive Action)

Pressão defensiva: passes permitidos por ação defensiva. Menor PPDA = maior pressing.

### Primeiro marcador / First Goalscorer

Jogador que marca o **primeiro gol** da partida. Own goal geralmente não conta ou conta como "sem marcador" — ver regras da casa.

### Probabilidade real

Estimativa do verdadeiro chance do evento (modelo, histórico, xG). Contrasta com probabilidade implícita.

### Prop (Proposition Bet)

Aposta em evento específico não ligado diretamente ao resultado (jogador marca, escanteios, cartões).

### Push

Devolução do stake por empate exato na linha (comum em handicap asiático inteiro ou totais inteiros em algumas linhas).

---

## R

### Red

Aposta **perdida**. Perda do stake (exceto half loss em asiáticos).

### ROI (Return on Investment)

Retorno sobre investimento total apostado.

`ROI% = (Lucro_líquido / Total_apostado) × 100`

### Rotação de elenco

Time reserva ou desfalques por prioridade de competição. Impacta indicadores e deve constar no checklist.

---

## S

### Seleção

Escolha específica dentro de um mercado (ex.: "Over 2.5", "Casa", "Haaland marcar").

### Shots on Target

Ver [Chute no gol](#chute-no-gol--shot-on-target-sot).

### Single (Simples)

Bilhete com uma única seleção.

### Stake (Valor apostado)

Quantia em risco na aposta. Unidades ou % da bankroll.

### Suggested Bet / Value Bet

Aposta com **EV positivo** segundo modelo ou análise.

---

## T

### Tiros de meta / Goal Kicks

Reposição do goleiro. Mercado de estatística em casas especializadas.

### Ticket

Ver [Bilhete](#bilhete).

---

## U

### Under

Aposta em que o total **fica abaixo** da linha (ex.: Under 2.5 = 0, 1 ou 2 gols).

### Unit (Unidade)

Fração padronizada da bankroll (ex.: 1u = 1% da banca).

---

## V

### Value Bet

Aposta em que a probabilidade real estimada é **maior** que a probabilidade implícita da odd oferecida.

`Value quando: P_real > 1/Odd`

### Void

Aposta **anulada** — stake devolvido, sem ganho nem perda. Ocorre em jogos cancelados, empate em DNB, jogador não titular em alguns props (ver regras).

### Vig

Ver [Margem da casa](#margem-da-casa--overround--vig).

---

## X

### xG

Ver [Expected Goals](#expected-goals-xg).

### xGA

Expected Goals Against — xG sofrido (qualidade das chances cedidas).

---

## Z

### Zebra

Time ou seleção **azarão** — odd alta, baixa expectativa de vitória. Upsets geram alto ROI em apostas corretas e alto RED em favoritos mal avaliados.

---

## Tabela de conversão rápida

| Odd decimal | Prob. implícita (sem margem) | Fair odd se P=50% |
|-------------|------------------------------|-------------------|
| 1.20 | 83,3% | 2.00 |
| 1.50 | 66,7% | 2.00 |
| 2.00 | 50,0% | 2.00 |
| 2.50 | 40,0% | 2.00 |
| 3.00 | 33,3% | 2.00 |
| 5.00 | 20,0% | 2.00 |
| 10.00 | 10,0% | 2.00 |

---

## Referências cruzadas

- Mercados detalhados: [markets/](./markets/)
- Probabilidades e EV: [ai/probabilidades.md](./ai/probabilidades.md), [ai/value-bet.md](./ai/value-bet.md)
- Indicadores: [ai/indicadores.md](./ai/indicadores.md)
