# DATABASE.md

## PostgreSQL via Prisma

O banco armazena **conhecimento**, não usuários (apenas 1 admin via env vars).

## Entidades

### Core

| Tabela | Descrição |
|--------|-----------|
| `competitions` | Competições esportivas |
| `seasons` | Temporadas |
| `teams` | Equipes |
| `players` | Jogadores |
| `matches` | Partidas |

### Estatísticas

| Tabela | Descrição |
|--------|-----------|
| `match_statistics` | Stats por partida |
| `team_statistics` | Stats agregadas por equipe/período |
| `player_statistics` | Stats por jogador/período |

### Odds e Mercados

| Tabela | Descrição |
|--------|-----------|
| `markets` | Tipos de mercado |
| `odds` | Odds atuais |
| `odds_history` | Histórico de odds |

### Análise

| Tabela | Descrição |
|--------|-----------|
| `predictions` | Previsões do Analysis Engine |
| `snapshots` | Registros imutáveis de análises |

### Bilhetes

| Tabela | Descrição |
|--------|-----------|
| `tickets` | Bilhetes montados |
| `ticket_selections` | Seleções dentro de bilhetes |

### Pesquisa

| Tabela | Descrição |
|--------|-----------|
| `research_strategies` | Estratégias/hipóteses |
| `simulations` | Resultados de simulações |

## Índices Importantes

```sql
-- Matches
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_competition ON matches(competition_id);

-- Snapshots
CREATE INDEX idx_snapshots_match ON snapshots(match_id);
CREATE INDEX idx_snapshots_date ON snapshots(analyzed_at);

-- Odds
CREATE INDEX idx_odds_match ON odds(match_id);
CREATE INDEX idx_odds_history_match ON odds_history(match_id, recorded_at);

-- Team Statistics
CREATE INDEX idx_team_stats_team ON team_statistics(team_id, period);
```

## Snapshots (JSON Structure)

O campo `data` em snapshots armazena o estado completo da análise:

```json
{
  "odds": [...],
  "homeForm": { "last5": {...}, "last10": {...} },
  "awayForm": { "last5": {...}, "last10": {...} },
  "h2h": {...},
  "markets": [
    {
      "type": "OVER_UNDER",
      "selection": "Over 2.5",
      "probability": 0.62,
      "fairOdd": 1.61,
      "bookmakerOdd": 1.85,
      "ev": 0.147,
      "confidence": 78
    }
  ],
  "predictedResult": "2-1",
  "overallConfidence": 75
}
```

Após o jogo, `actualResult` e `accuracy` são atualizados.

## Migrations

- Usar `prisma migrate dev` em desenvolvimento
- Migrations versionadas em `apps/api/prisma/migrations/`
- Nunca editar migrations já aplicadas

## Seeds

Apenas para desenvolvimento:
- Competições de exemplo
- Times de exemplo
- Mercados padrão

## Conexão

```
DATABASE_URL=postgresql://soccer:soccer@localhost:5432/soccer_analytics
REDIS_URL=redis://localhost:6379
```
