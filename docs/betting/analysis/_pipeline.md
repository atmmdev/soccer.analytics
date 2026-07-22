# Pipeline universal de análise

> **SSOT:** dados e ordem que **todo** mercado deve passar antes de BET / WATCH / SKIP.  
> Playbooks específicos em `analysis/*.md` só listam o **delta** (indicadores extras).  
> Score: [ai/score.md](../ai/score.md) · Checklist: [ai/checklist.md](../ai/checklist.md) · Value: [ai/value-bet.md](../ai/value-bet.md)

---

## Objetivo

Padronizar como humanos e agentes de IA analisam **qualquer** mercado da KB, sem reinventar o fluxo por arquivo.

---

## Dados necessários (universais)

| # | Dado | Crítico | Notas |
|---|------|---------|-------|
| 1 | Média últimos **10** jogos (métrica do mercado) | ✅ | Amostra mínima operacional |
| 2 | Média **casa** (mandante no contexto) | ✅ | Split home |
| 3 | Média **fora** (visitante no contexto) | ✅ | Split away |
| 4 | **Adversário** (concede / gera a métrica) | ✅ | Força do oponente |
| 5 | **Escalação** (titulares / minutos) | ✅ | Props de jogador: obrigatório |
| 6 | **Árbitro** | ⚠️ | Mais crítico em cartões/faltas |
| 7 | **Clima** | ⚠️ | Fase 2 — só se fonte confiável |
| 8 | **Importância** da partida | ✅ | Título, rebaixamento, “jogo morto” |
| 9 | **Odd justa** (modelo) | ✅ | Ver [probabilidades.md](../ai/probabilidades.md) |
| 10 | **Value Bet** (EV > 0) | ✅ | Ver [value-bet.md](../ai/value-bet.md) |
| 11 | **Score IA** (0–100) | ✅ | Ver [score.md](../ai/score.md) |

**Regra:** item crítico ausente → no máximo WATCH; dois críticos ausentes → SKIP.

---

## Ordem de análise (obrigatória)

```text
1. Identificar fixture + mercado + linha
2. Checklist pré-jogo (ai/checklist.md)
3. Coletar dados universais + delta do playbook
4. Estimar probabilidade (modelo ou implícita documentada)
5. Calcular odd justa + EV
6. Calcular Score IA
7. Validar correlação se for bilhete múltiplo (ai/correlacoes.md)
8. Decisão: BET | WATCH | SKIP
```

---

## Decisão

| Condição | Ação |
|----------|------|
| Score ≥ limiar do playbook **e** EV > 0 | **BET** |
| Score alto mas EV ≤ 0 | **WATCH** (sem edge) |
| Score abaixo do limiar ou dados críticos faltando | **SKIP** |
| Correlação perigosa no bilhete | **SKIP** ou reduzir stake |

Limiar padrão global (se o playbook não definir): **70** (BET forte a partir de **85**).

---

## O que nunca inventar

- Probabilidade sem modelo nem amostra
- Escalação “provável” como confirmada
- Liquidação diferente de [markets/](../markets/) — sempre linkar o canônico
- Árbitro/clima sem fonte — omitir e penalizar `S_dados`

---

## Relação com o código

| Etapa | Módulo |
|-------|--------|
| Ingestão stats/odds/lineups | Data Engine / API-Football |
| Probabilidade + fair odd + EV | Analysis Engine / Player Engine |
| Score / explicação | AI Engine (alinhado a `ai/score.md`) |
| Bilhete | Ticket Engine |

Plano: [PLAN-kb-betting-clean-architecture.md](../../../.ai/09-development/PLAN-kb-betting-clean-architecture.md)
