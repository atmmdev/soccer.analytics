# Marcado de Atuação — Gate 4/7

> Filtro operacional antes de apostar: **7 critérios por mercado · mínimo 4 OK**  
> **Regra:** se **< 4/7** → **SKIP** (proibido apostar sem edge confirmado)

---

## Como funciona

Para cada mercado candidato, avalie **7 indicadores** (checklist específico abaixo). Conte quantos passam:

| Resultado | Decisão |
|-----------|---------|
| **≥ 4/7** | Elegível — prosseguir para EV e Score IA |
| **< 4/7** | **SKIP** automático |

Este gate **não substitui** EV+ — é filtro de qualidade da amostra e contexto.

---

## Tabela por mercado

| Mercado | O que mede | Odds típicas | Critério gate (1 de 7) | Combinação forte |
|---------|------------|--------------|------------------------|------------------|
| **Over 0.5 HT** | Intensidade inicial | 1,35 – 1,55 | Média ≥ 2,6 gols (últimos 10) | Over 1.5 + BTTS |
| **Over 1.5 FT** | Tendência clara de gols | 1,30 – 1,45 | BTTS ≥ 70% (histórico) | Over 2.5 + BTTS |
| **Over 2.5 FT** | Jogo aberto | 1,70 – 1,95 | Favorito marca em ≥ 90% | SOT Over + Over 1.5 |
| **BTTS** | Ataques bons + defesas vazadas | 1,70 – 2,00 | ≥ 10 finalizações médias/jogo | Over 0.5 HT + Over 1.5 FT |
| **Time marca 1+** | Favorito ofensivo | 1,40 – 1,65 | ≥ 9 SOT somados (média) | Escanteios Over + SOT Over |
| **DC + Over 1.5** | Superioridade + gols | 1,60 – 1,90 | Não é mata-mata travado | — |
| **Escanteios Over 8.5/9.5** | Pressão pelos lados | 1,75 – 1,95 | Escalações ofensivas confirmadas | SOT Over |
| **SOT Over** | Volume real de finalizações | 1,70 – 2,10 | Liga/jogo com ritmo (ver [ligas.md](./ligas.md)) | Over 1.5 FT |
| **BTTS + Over 2.5** | Jogo franco | 2,10+ | xG combinado > 2,8 | — |
| **Over 0.5 HT + Over 1.5 FT** | Ritmo desde o início | 1,90 – 2,20 | λ_HT e λ_FT favoráveis | BTTS |

Odds são **referência operacional** (pré-jogo/live) — comparar sempre com fair odd modelada.

---

## Checklist 7 itens (genérico)

Adaptar por mercado; marcar ✅ ou ❌:

| # | Critério | Bloqueante se ❌ |
|---|----------|------------------|
| 1 | Escalação titular confirmada | ✅ |
| 2 | Sem lesão crítica (artilheiro/criador/goleiro) | ✅ |
| 3 | Critério específico da tabela acima | ✅ |
| 4 | Liga compatível ([ligas.md](./ligas.md)) | ⚠️ |
| 5 | Amostra ≥ 10 jogos recentes | ⚠️ |
| 6 | EV > 5% (modelo) | ✅ |
| 7 | Sem correlação ++ excessiva no bilhete | ✅ |

**Contagem:** mínimo **4 ✅** incluindo itens 1, 3 e 6 quando aplicáveis.

---

## Exemplo — Over 0.5 HT

| # | Item | Status |
|---|------|--------|
| 1 | Titulares OK | ✅ |
| 2 | Sem lesão ataque | ✅ |
| 3 | Média 2,8 gols (10j) | ✅ |
| 4 | Bundesliga (liga aberta) | ✅ |
| 5 | 10 jogos amostra | ✅ |
| 6 | EV 7,2% | ✅ |
| 7 | Bilhete simples | ✅ |

**Resultado:** 7/7 → elegível · combinação sugerida: Over 1.5 FT + BTTS (avaliar correlação).

---

## Exemplo — SKIP

| # | Item | Status |
|---|------|--------|
| 1 | Titulares OK | ✅ |
| 2 | Artilheiro fora | ❌ |
| 3 | BTTS 55% (precisa 70%) | ❌ |
| 4 | Serie A mata-mata | ⚠️ |
| 5 | 8 jogos amostra | ❌ |
| 6 | EV 2% | ❌ |
| 7 | OK | ✅ |

**Resultado:** 2/7 → **SKIP**

---

## Integração IA

```yaml
marcado_de_atuacao:
  mercado: "Over 0.5 HT"
  criterios_ok: 5
  criterios_total: 7
  gate_pass: true
  combinacao_sugerida: "Over 1.5 + BTTS"
  decision: "proceed_to_ev"
```

Se `gate_pass: false` → `decision: SKIP` sem calcular bilhete.

---

## Referências

- [checklist.md](./checklist.md) — protocolo completo pré-jogo
- [correlacoes.md](./correlacoes.md) — combinações fortes
- [ligas.md](./ligas.md) — perfil por competição
- [score.md](./score.md) — Score IA pós-gate
