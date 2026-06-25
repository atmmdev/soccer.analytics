# TASKS.md — Tarefas de Desenvolvimento

## Fase Atual: 2 — Match Center

### Concluído (Fase 0 + 1)

- [x] Foundation completa (monorepo, auth, prisma, layout)
- [x] Dashboard com widgets Shadcn
- [x] Shadcn UI integrado
- [x] Logo corrigido

### Concluído (Fase 2)

- [x] API `/matches` com filtros
- [x] API `/matches/:id` detalhes
- [x] API `/matches/competitions`
- [x] Seed com times, competições e jogos
- [x] Página Match Center com abas por status
- [x] Página de detalhes da partida

### Próximo

- [ ] Data Engine (importação de APIs externas)
- [ ] Fase 3 — Match Analyzer

## Como Usar

1. Verificar fase em `ROADMAP.md`
2. Pegar próxima tarefa não marcada
3. Implementar seguindo `RULES.md`
4. Marcar como concluída
5. Atualizar roadmap se fase completa

## Setup banco (necessário para jogos reais)

```bash
pnpm docker:up
pnpm db:push
pnpm db:seed
```
