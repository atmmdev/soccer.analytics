# Ligas — Perfil Tático e Mercados Preferenciais

> Mapa operacional: competição → estilo de jogo → mercados com melhor encaixe  
> **Fonte:** playbook operacional Soccer Analytics (sports-trading) · calibrar com EV e Score IA

---

## Como usar

1. Identificar a **liga** da fixture.
2. Consultar mercados **preferenciais** e **evitar** para aquela competição.
3. Validar com [marcado-de-atuacao.md](./marcado-de-atuacao.md) (gate 4/7) e [checklist.md](./checklist.md).
4. Nunca apostar só por liga — edge exige EV+ no modelo.

---

## Mapa por competição

| Liga | Mercados preferenciais | Perfil tático | Tipo de bilhete sugerido |
|------|------------------------|---------------|--------------------------|
| **Premier League** | Over 1.5 · Over 0.5 HT · SOT · Escanteios · BTTS | Intensidade alta, transições, muitos cruzamentos | Simples segura |
| **Bundesliga** | Over 2.5 · BTTS · SOT · Over 0.5 HT | Linhas altas, jogo franco, muito chute | Valor moderado |
| **Eredivisie** | Over 2.5 · BTTS · SOT · BTTS + Over 2.5 | Ataque forte, defesa fraca | Múltipla estratégica |
| **LaLiga** | Over 1.5 · SOT favorito · Escanteios · Time marca 1+ | Posse longa, finalização qualificada | Múltipla (odd alta) |
| **Serie A** | Over 1.5 · Time marca 1+ · Escanteios · DC + Over 1.5 | Tático, compacto, cruzamentos | Simples / moderado |
| **Liga Argentina** | Under 2.5 · Under 1.0 HT · Escanteios · Cartões · DC | Físico, truncado, poucos gols | Under / disciplina |
| **Primeira Liga** | Time marca 1+ · Over 1.5 · Dupla chance | Favoritos dominantes, pressão constante | Simples segura |
| **Brasileirão Série A** | SOT · Escanteios · Over 1.5 | Caótico, mandante pressiona, chute médio | Simples / stats |

---

## Ligas abertas (Over / BTTS / HT)

Priorizar quando o mercado exige **ritmo e gols**:

- Alemanha (Bundesliga)
- Holanda (Eredivisie)
- Suécia, Bélgica (ligas secundárias europeias)
- Japão, Brasil Série B (contexto live — ver [strategies/live.md](../strategies/live.md))

**Indicadores:** média gols > 2,5 (10j) · BTTS ≥ 70% · ≥ 10 finalizações/jogo.

---

## Ligas fechadas (Under / cartões)

Priorizar quando o mercado exige **jogo truncado**:

- Argentina (Liga Profesional)
- Serie A em jogos de mata-mata cautelosos
- Copas com fase eliminatória (avaliar caso a caso)

**Indicadores:** média gols < 2,2 · Under 1.0 HT frequente · cartões elevados.

---

## Brasileirão — notas específicas

| Aspecto | Implicação |
|---------|------------|
| Mandante forte | +SOT · +Escanteios · Over 1.5 |
| Jogo equilibrado | DC · empate frequente em bilhetes 1X2 |
| Placares | Alta variância — usar matriz Poisson ([examples/bilhete-variacoes-brasileirao.md](../examples/bilhete-variacoes-brasileirao.md)) |
| Viagens / calendário | ⚠️ Rotação — checklist 2.5 |

---

## Rotina operacional sugerida

| Parâmetro | Valor de referência |
|-----------|---------------------|
| Dias | Quarta · Sábado · Domingo |
| Frequência | 3× por semana |
| Stake unitário | 1–2% da banca (playbook: ~R$ 10/unidade em banca de R$ 500–1.000) |
| Orçamento diário | ~4–8 unidades |
| Orçamento semanal | ~12–24 unidades |

Converter valores fixos em **% bankroll** conforme [value-bet.md](./value-bet.md).

---

## Integração Soccer Analytics

| Engine | Uso por liga |
|--------|--------------|
| Analysis Engine | λ gols, BTTS, Over/Under por liga |
| Statistics Engine | SOT, escanteios (MatchStatistics) |
| Player Engine | Time marca 1+, props |
| Ticket Builder | Penalidade correlação em múltiplas Eredivisie/LaLiga |

---

## Referências

- [marcado-de-atuacao.md](./marcado-de-atuacao.md) — critérios 4/7 por mercado
- [correlacoes.md](./correlacoes.md) — combinações fortes
- [strategies/live.md](../strategies/live.md) — entrada in-play
- [indicadores.md](./indicadores.md) — xG, PPDA, shots
