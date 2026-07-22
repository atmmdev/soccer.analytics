# Bilhetes Bet365 — dados exportados

## Estrutura

```
bilhetes/
├── 2025/…/*.pdf              ← origem (pode deletar após validar JSONs)
├── 2026/<mês>/*.pdf
├── imported/                 ← fonte de verdade para o sistema
│   ├── _export-report.json
│   ├── 2025/*.json
│   └── 2026/<mês>/*.json
└── README.md
```

## Status da exportação

| Mês | JSONs |
|-----|------:|
| 2025 | 2 |
| 2026/janeiro | 14 |
| 2026/fevereiro | 52 |
| 2026/março | 33 |
| 2026/abril | 160 |
| 2026/maio | 61 |
| 2026/junho | 85 |
| 2026/julho | 41 |
| **Total** | **448** |

Relatório completo: [`imported/_export-report.json`](./imported/_export-report.json) (pode estar desatualizado até novo export).

## Atenção antes de deletar PDFs

- Bilhetes com odd ~1,00 ou ausente — revise/edite na UI ou no JSON.
- O bilhete `2026/junho/01062026-101347hs.json` está **curado manualmente** (`_curated: true`).
- Import com **dedupe por `bet365Ref`** (evita cópias do mesmo bilhete em pastas diferentes).

## Regenerar + limpar banco + reimportar

```bash
cd apps/api
pnpm db:reimport-tickets
# equivalente a:
# pnpm db:clean-study-tickets
# pnpm exec ts-node prisma/export-all-study-tickets.ts --force
# pnpm db:import-tickets-all
```

Parser atual: **v2** (Criar Aposta + múltiplas clássicas).  
Relatórios: `_export-report.json`, `_import-report.json`.

**Status:** 448 no banco (após remoção de duplicatas 2025 em janeiro).  
Bilhetes com odd ~1,00 no PDF ainda precisam edição manual na UI.

## Campos do JSON

- `bet365Ref`, `placedAt`, `betType`, `status` (`WON`/`LOST`/`CASHED_OUT`/…)
- `stake`, `combinedOdd`, `potentialReturn`, `actualReturn`, `cashOut`
- `legs[]`: seleção, mercado, jogo, odd, boostedOdd, status
- `rawLines` + `warnings` (para IA / reprocessamento)
- **Sem PII** (nome, CPF, endereço removidos no parse)
