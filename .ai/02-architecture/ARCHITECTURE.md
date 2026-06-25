# ARCHITECTURE.md

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js (apps/web)                    │
│  Dashboard │ Matches │ Analyzer │ Tickets │ Research    │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────┐
│                   NestJS (apps/api)                      │
│  ┌─────────┐  ┌──────────────────────────────────────┐  │
│  │  Auth   │  │              Engines                  │  │
│  │  JWT    │  │  Data │ Match │ Team │ Player │ Stats │  │
│  └─────────┘  │  Analysis │ Market │ Ticket │ Sim    │  │
│               │  Research │ EV │ Recommendation │ AI  │  │
│               └──────────────────────────────────────┘  │
└──────────┬───────────────────────┬──────────────────────┘
           │                       │
    ┌──────▼──────┐         ┌──────▼──────┐
    │ PostgreSQL  │         │    Redis    │
    │  (Prisma)   │         │  (Cache +   │
    │             │         │   BullMQ)   │
    └─────────────┘         └─────────────┘
```

## Monorepo

```
soccer.analytics/
├── apps/
│   ├── api/          # NestJS
│   └── web/          # Next.js
├── packages/
│   └── shared/       # Types, constants, utils
├── .ai/              # SDD documentation
├── docker-compose.yml
└── package.json      # pnpm workspaces
```

## Backend Architecture

### Camadas

1. **Controllers** — HTTP routing, validation
2. **Services** — Business logic orchestration
3. **Engines** — Domain-specific intelligence
4. **Repositories** — Data access (via Prisma)
5. **DTOs** — Input/output contracts

### Engine Communication

```
Data Engine → imports external data
     ↓
Match/Team/Player/Statistics Engines → process raw data
     ↓
Analysis Engine → orchestrates, produces confidence/probability/EV
     ↓
Market Engine → transforms into betting markets
     ↓
Recommendation Engine → suggests markets
     ↓
AI Engine → explains recommendations
```

### Snapshot Flow

```
Match Analysis Request
     ↓
Engines process data
     ↓
Analysis Engine produces results
     ↓
Snapshot saved to DB (immutable record)
     ↓
After match ends → update with real result
     ↓
Metrics calculated (accuracy, ROI)
```

## Frontend Architecture

### Padrões

- **App Router** — file-based routing
- **Server Components** — default, data fetching
- **Client Components** — interactivity only
- **TanStack Query** — server state management
- **Zustand** — UI state (filters, selections)

### API Layer

```typescript
// lib/api/client.ts
const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

// hooks/useMatches.ts
export function useMatches(filters) {
  return useQuery({ queryKey: ['matches', filters], queryFn: () => ... });
}
```

## Autenticação

```
Login → API validates credentials
     → Returns access_token (15min) + refresh_token (7d)
     → Frontend stores in httpOnly cookies
     
Request → Bearer token in header
     → Guard validates JWT
     
Token expired → Refresh endpoint
     → New access_token + rotated refresh_token
```

## Cache Strategy

| Dado | TTL | Storage |
|------|-----|---------|
| Match list (today) | 5min | Redis |
| Team stats | 1h | Redis |
| Analysis results | Permanent | PostgreSQL (snapshots) |
| Odds | 15min | Redis + PostgreSQL history |

## Jobs Assíncronos (BullMQ)

- Importação de dados de APIs externas
- Cálculo de estatísticas em batch
- Simulações de estratégias
- Geração de snapshots em massa

## Deploy (Futuro)

- **API:** Docker container
- **Web:** Vercel ou Docker
- **DB:** PostgreSQL managed
- **Redis:** Redis managed
