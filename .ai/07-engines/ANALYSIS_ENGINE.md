# ANALYSIS_ENGINE.md

## Visão Geral

O Analysis Engine é o **cérebro** do sistema. Recebe dados de todos os outros engines e produz:

- **Confidence** — score de confiança (0-100)
- **Probability** — probabilidade calculada (0-1)
- **Fair Odds** — odd justa baseada na probabilidade
- **EV** — Expected Value
- **Recommendation** — BET / SKIP / WATCH

## Inputs

```typescript
interface AnalysisInput {
  match: Match;
  homeTeamStats: TeamStatistics;    // últimos N jogos
  awayTeamStats: TeamStatistics;
  h2hStats: H2HStatistics;
  matchStats?: MatchStatistics;      // se jogo ao vivo
  currentOdds: Odd[];
  markets: Market[];
}
```

## Outputs

```typescript
interface AnalysisOutput {
  matchId: string;
  analyzedAt: Date;
  markets: MarketAnalysis[];
  predictedScore?: string;
  overallConfidence: number;
  snapshot: Snapshot;
}
```

## Pipeline

```
1. Collect Data
   ├── Match Engine → match details
   ├── Team Engine → home/away form (5, 10, 15, 20 games)
   ├── Player Engine → key players status
   └── Statistics Engine → aggregated metrics

2. Calculate Probabilities
   ├── Poisson distribution for goals
   ├── Historical win rates
   ├── Form weighting (recent games weigh more)
   └── H2H adjustment

3. Calculate Fair Odds
   └── fairOdd = 1 / probability

4. Calculate EV
   └── ev = (probability × bookmakerOdd) - 1

5. Score Confidence
   ├── Data completeness (more data = higher confidence)
   ├── Sample size (more games = higher confidence)
   ├── Consistency (stable form = higher confidence)
   └── Market liquidity (more bookmakers = higher confidence)

6. Generate Recommendations
   ├── EV > threshold → BET
   ├── EV near zero → WATCH
   └── EV < 0 → SKIP

7. Save Snapshot
   └── Immutable record for future accuracy measurement
```

## Algoritmos

### Goal Probability (Poisson)

```typescript
function calculateGoalProbability(
  avgGoalsFor: number,
  avgGoalsAgainst: number,
  leagueAvgGoals: number
): { home: number; away: number } {
  const homeExpected = (avgGoalsFor * avgGoalsAgainst) / leagueAvgGoals;
  const awayExpected = (awayAvgGoalsFor * homeAvgGoalsAgainst) / leagueAvgGoals;
  // Apply Poisson distribution
  return { home: homeExpected, away: awayExpected };
}
```

### Form Weighting

```typescript
const WEIGHTS = {
  last5: 0.40,
  last10: 0.30,
  last15: 0.20,
  last20: 0.10,
};
```

### Confidence Scoring

```typescript
function calculateConfidence(factors: ConfidenceFactors): number {
  const weights = {
    dataCompleteness: 0.25,
    sampleSize: 0.25,
    consistency: 0.25,
    marketLiquidity: 0.25,
  };
  return Object.entries(weights).reduce(
    (score, [key, weight]) => score + factors[key] * weight,
    0
  );
}
```

## Thresholds

| Métrica | BET | WATCH | SKIP |
|---------|-----|-------|------|
| EV | > 5% | 0-5% | < 0% |
| Confidence | > 70 | 50-70 | < 50 |

## Integração com Outros Engines

- **Market Engine** — recebe probabilidades, retorna análise por mercado
- **EV Engine** — calcula EV detalhado
- **Recommendation Engine** — aplica thresholds e gera recomendações
- **AI Engine** — recebe output e gera explicação textual
- **Snapshot** — salva tudo após análise

## Regras

1. Nunca retornar recomendação sem snapshot
2. Sempre incluir confidence score
3. EV negativo nunca gera recomendação BET
4. Dados insuficientes reduzem confidence, não bloqueiam análise
