# API-Football (api-sports.io)

> Contrato mínimo do que o Soccer Analytics **usa hoje**.  
> Código: `apps/api/src/engines/data-engine/api-football.provider.ts`  
> Arquitetura: [`.ai/02-architecture/ARCHITECTURE.md`](../../.ai/02-architecture/ARCHITECTURE.md)

## Configuração

- Env: `API_FOOTBALL_KEY`
- Base: `https://v3.football.api-sports.io`
- Header: `x-apisports-key`

## Endpoints usados

| Endpoint | Uso no produto |
|----------|----------------|
| `GET /fixtures?date=` | Jogos do dia |
| `GET /odds?fixture=` | Odds por partida |
| `GET /odds?date=&page=` | Odds em lote por data |
| `GET /fixtures/statistics` | Stats de partida (gols, chutes, SOT, escanteios, …) |
| `GET /fixtures/players` | Performances de jogador |
| `GET /fixtures/lineups` | Escalações (titulares) |

## Campos relevantes para análise

- Partida: status, placar, times, competição, `externalId`
- Stats: gols, chutes, shots on target, escanteios, cartões (quando a API envia)
- Jogador: minutos, gols, assists, shots on target (quando disponível)
- Lineup: titulares para props

## Limites / cuidados

- Sem key → provider reporta `configured: false`; sync não importa dados reais.
- Paginação em `/odds` por data.
- Definições Opta/API podem divergir levemente da Bet365 — liquidação da aposta segue a casa.

## Não documentar aqui

- Catálogos manuais de times/árbitros (dados vivos no PostgreSQL via sync).
