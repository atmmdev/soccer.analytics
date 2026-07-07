# Score IA — Escala de Confiança 0–100

> Documento para agentes de IA do Soccer Analytics  
> Define como calcular o **Score IA** de uma seleção ou bilhete

---

## Objetivo

O **Score IA** quantifica a **confiança analítica** de uma sugestão de aposta, de **0** (sem base) a **100** (máxima confiança estatística). Não é probabilidade de acerto — é qualidade da **decisão informada**.

| Score | Classificação | Ação sugerida |
|-------|---------------|---------------|
| 0–39 | Insuficiente | SKIP |
| 40–54 | Fraca | SKIP ou WATCH |
| 55–69 | Moderada | WATCH |
| 70–84 | Forte | BET (se EV > 0) |
| 85–100 | Muito forte | BET prioritário |

---

## Fórmula geral

```
Score IA = (
  W_dados   × S_dados +
  W_amostra × S_amostra +
  W_modelo  × S_modelo +
  W_mercado × S_mercado +
  W_contexto× S_contexto
) × Penalidade_correlação
```

Onde cada `S_*` ∈ [0, 100] e pesos somam **1.0**.

### Pesos padrão (configuráveis)

| Componente | Peso | Descrição |
|------------|------|-----------|
| `W_dados` | 0,25 | Completude e qualidade dos dados |
| `W_amostra` | 0,20 | Tamanho da amostra histórica |
| `W_modelo` | 0,25 | Adequação do modelo ao mercado |
| `W_mercado` | 0,15 | Liquidez e estabilidade do mercado |
| `W_contexto` | 0,15 | Fatores pré-jogo (lesões, motivação) |

---

## S_dados — Qualidade dos dados (0–100)

| Critério | Pontos |
|----------|--------|
| Stats de partida importadas (xG, chutes, escanteios) | +25 |
| Odds atualizadas (< 4h) | +20 |
| Escalação confirmada | +20 |
| Dados de jogador (minutos, gols/90) | +15 |
| Dados de árbitro / clima | +10 |
| H2H com ≥ 5 jogos | +10 |
| Dados ausentes ou só fallback | 0–30 |

**Penalidades:** API indisponível (-30), jogo sem `externalId` (-50).

---

## S_amostra — Tamanho da amostra (0–100)

```
S_amostra = min(100, (jogos_analisados / jogos_alvo) × 100)
```

| Período | Jogos alvo |
|---------|------------|
| Forma recente | 10 |
| Casa/Fora | 10 |
| H2H | 8 |
| Props jogador | 10 partidas com minutos |

| Jogos | Score |
|-------|-------|
| 0–2 | 20 |
| 3–5 | 45 |
| 6–9 | 70 |
| 10–15 | 85 |
| 16+ | 100 |

---

## S_modelo — Adequação do modelo (0–100)

| Mercado | Modelo Soccer Analytics | Score base |
|---------|---------------------------|------------|
| 1X2, Over 2.5, BTTS | Poisson (matriz) | 90 |
| Escanteios, Cartões O/U | Poisson λ | 75 |
| Handicap asiático | Matriz Poisson | 80 |
| Anytime scorer | Player Engine | 70 |
| Placar exato | Poisson (célula) | 50 |
| Props raros | Implícita / heurística | 40 |
| Sem modelo | — | 25 |

Ajuste: `S_modelo += (EV × 50)` cap em 100 se EV > 0,05.

---

## S_mercado — Mercado e liquidez (0–100)

| Fator | Pontos |
|-------|--------|
| Mercado principal (1X2, O/U 2.5) | +40 |
| Margem da odd < 5% | +25 |
| Movimento de odd a favor (CLV esperado) | +20 |
| Mercado de nicho / baixa liquidez | +10 |
| Odd promocional / limitada | -20 |

---

## S_contexto — Contexto pré-jogo (0–100)

Checklist binário (cada item +10, máx 100):

- [ ] Time titular sem desfalques críticos
- [ ] Motivação alinhada (título, rebaixamento, mata-mata)
- [ ] Descanso adequado (≥ 4 dias)
- [ ] Sem viagem longa / fuso extremo
- [ ] Clima não extremo
- [ ] Árbitro com média compatível com o mercado
- [ ] Importância do jogo documentada
- [ ] Sem rotação confirmada
- [ ] Confronto tático favorável ao mercado
- [ ] Odd estável nas últimas 24h

---

## Penalidade de correlação

Ao avaliar **bilhetes múltiplos**, aplicar multiplicador:

| Situação | Multiplicador |
|----------|---------------|
| Seleções independentes | 1,00 |
| Correlação positiva moderada | 0,92 |
| Correlação positiva forte (ex.: Casa + Over) | 0,85 |
| Correlação negativa artificial | 0,88 |
| 3+ pernas mesma partida correlacionadas | 0,75 |

Ver [correlacoes.md](./correlacoes.md).

---

## Exemplo numérico

**Seleção:** Over 2.5 gols — Premier League

| Componente | Score | Peso | Contribuição |
|------------|-------|------|--------------|
| S_dados | 85 | 0,25 | 21,25 |
| S_amostra | 90 | 0,20 | 18,00 |
| S_modelo | 88 | 0,25 | 22,00 |
| S_mercado | 75 | 0,15 | 11,25 |
| S_contexto | 70 | 0,15 | 10,50 |

**Score bruto:** 83,0 → **Score IA: 83** (Forte → BET se EV > 5%)

---

## Integração com Recommendation Engine

| EV | Score IA | Recomendação |
|----|----------|--------------|
| > 5% | ≥ 70 | BET |
| ≥ 0% | ≥ 50 | WATCH |
| qualquer | < 50 | SKIP |
| < 0% | qualquer | SKIP |

Alinhado a `getRecommendation()` no Analysis Engine da API.

---

## Versionamento de pesos

Pesos devem ser calibrados via backtest no Research Lab. Registrar alterações em changelog com ROI e hit rate por faixa de score.
