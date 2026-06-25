# DOMAIN.md — Modelo de Domínio

## Entidades Principais

### Competition
Competição esportiva (Brasileirão, Champions League, etc.)

### Season
Temporada de uma competição

### Team
Equipe de futebol

### Player
Jogador vinculado a uma equipe

### Match
Partida entre duas equipes

### Market
Tipo de mercado de aposta (1X2, Over 2.5, BTTS, etc.)

### Odd
Cotação de um mercado para uma partida

### OddsHistory
Histórico de variação de odds

## Estatísticas

### MatchStatistics
Estatísticas de uma partida específica (gols, escanteios, cartões, xG, etc.)

### TeamStatistics
Estatísticas agregadas de uma equipe (forma, médias, tendências)

### PlayerStatistics
Estatísticas de um jogador (gols, assistências, minutos, etc.)

## Análise

### Prediction
Previsão gerada pelo Analysis Engine

### Snapshot
Registro imutável de uma análise completa no momento pré-jogo

```
Snapshot {
  matchId
  analyzedAt
  odds: Odd[]
  homeForm: TeamStatistics
  awayForm: TeamStatistics
  markets: MarketAnalysis[]
  confidence: number
  expectedValue: number
  predictedResult: string
  // Após o jogo:
  actualResult?: string
  accuracy?: number
}
```

## Bilhetes

### Ticket
Bilhete montado pelo Ticket Builder

### TicketSelection
Seleção individual dentro de um bilhete (mercado + odd)

## Simulação e Pesquisa

### Simulation
Simulação de estratégia com dados históricos

### ResearchStrategy
Hipótese a ser testada no Research Lab

```
ResearchStrategy {
  name: "Over 2.5 Brasil últimos 500"
  filters: { competition, market, period }
  results: { roi, yield, winRate, drawdown }
}
```

## Value Objects

### ExpectedValue
```typescript
{
  probability: number    // 0-1
  fairOdd: number
  bookmakerOdd: number
  ev: number            // (probability * bookmakerOdd) - 1
  confidence: number    // 0-100
}
```

### MarketAnalysis
```typescript
{
  market: Market
  probability: number
  fairOdd: number
  bookmakerOdd: number
  ev: number
  confidence: number
  recommendation: 'BET' | 'SKIP' | 'WATCH'
}
```

### FormRecord
```typescript
{
  lastN: number          // 5, 10, 15, 20
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  avgGoalsFor: number
  avgGoalsAgainst: number
  avgCorners: number
  avgCards: number
  avgXG: number
  avgXGA: number
}
```

## Enums

```typescript
enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
}

enum MarketType {
  MATCH_RESULT = 'MATCH_RESULT',      // 1X2
  BTTS = 'BTTS',
  OVER_UNDER = 'OVER_UNDER',
  CORNERS = 'CORNERS',
  CARDS = 'CARDS',
  PLAYER = 'PLAYER',
  HANDICAP = 'HANDICAP',
}

enum TicketStatus {
  DRAFT = 'DRAFT',
  PLACED = 'PLACED',
  WON = 'WON',
  LOST = 'LOST',
  VOID = 'VOID',
}

enum RecommendationType {
  BET = 'BET',
  SKIP = 'SKIP',
  WATCH = 'WATCH',
}
```

## Relacionamentos

```
Competition 1──N Season
Season 1──N Match
Team 1──N Match (home/away)
Team 1──N Player
Match 1──N MatchStatistics
Match 1──N Odd
Match 1──N Snapshot
Match 1──N Prediction
Team 1──N TeamStatistics
Player 1──N PlayerStatistics
Ticket 1──N TicketSelection
ResearchStrategy 1──N Simulation
```
