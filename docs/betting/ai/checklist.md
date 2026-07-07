# Checklist — Análise Pré-Jogo

> Protocolo obrigatório para humanos e agentes de IA antes de sugerir mercado

---

## Como usar

1. Executar **todos** os itens aplicáveis.
2. Registrar status: ✅ OK · ⚠️ Atenção · ❌ Bloqueante
3. **❌ Bloqueante** em item crítico → SKIP automático.
4. Anexar score parcial ao Score IA ([score.md](./score.md)).

---

## 1. Identificação da partida

| # | Item | Crítico |
|---|------|---------|
| 1.1 | Fixture confirmada (data, hora, estádio) | ✅ |
| 1.2 | Competição e fase (liga, copa, amistoso) | ✅ |
| 1.3 | Jogo importado na API (`externalId`) | ✅ |
| 1.4 | Odds disponíveis e atualizadas | ✅ |

---

## 2. Escalação e elenco

| # | Item | Crítico |
|---|------|---------|
| 2.1 | Escalação oficial ou provável (< 24h) | ✅ |
| 2.2 | Titulares confirmados vs reservas | ✅ |
| 2.3 | Lesões: artilheiro / criador / zagueiro / goleiro | ✅ |
| 2.4 | Suspensões por cartão | ✅ |
| 2.5 | Rotação por outra competição | ⚠️ |
| 2.6 | Retorno de lesão (minutos limitados?) | ⚠️ |
| 2.7 | Novo técnico (amostra pequena) | ⚠️ |

---

## 3. Forma e estatísticas

| # | Item | Crítico |
|---|------|---------|
| 3.1 | Últimos 10 jogos — gols F/S | ✅ |
| 3.2 | Split **casa** (mandante) | ✅ |
| 3.3 | Split **fora** (visitante) | ✅ |
| 3.4 | xG e xGA no período | ✅ |
| 3.5 | Over/Under histórico | ⚠️ |
| 3.6 | BTTS histórico | ⚠️ |
| 3.7 | Escanteios médios (se mercado) | ⚠️ |
| 3.8 | Cartões médios (se mercado) | ⚠️ |
| 3.9 | H2H últimos 5–10 | ⚠️ |

---

## 4. Contexto tático

| # | Item | Crítico |
|---|------|---------|
| 4.1 | Estilo: posse vs contra-ataque | ⚠️ |
| 4.2 | Necessidade de vitória (tabela) | ⚠️ |
| 4.3 | Jogo "morto" (time já classificado) | ⚠️ |
| 4.4 | Derby / rivalidade | ⚠️ |
| 4.5 | Viagem longa / fuso | ⚠️ |

---

## 5. Árbitro e disciplina

| # | Item | Crítico |
|---|------|---------|
| 5.1 | Árbitro designado | ⚠️ |
| 5.2 | Média cartões/jogo do árbitro | ⚠️ (cartões) |
| 5.3 | Média faltas | ○ |

---

## 6. Clima e campo

| # | Item | Crítico |
|---|------|---------|
| 6.1 | Previsão chuva / vento / calor | ⚠️ |
| 6.2 | Gramado (alternativo?) | ○ |
| 6.3 | Altitude (Libertadores etc.) | ○ |

---

## 7. Mercado e odds

| # | Item | Crítico |
|---|------|---------|
| 7.1 | Odd atual vs fair odd (modelo) | ✅ |
| 7.2 | EV calculado > threshold | ✅ |
| 7.3 | Movimento de odd últimas 24h | ⚠️ |
| 7.4 | Margem do mercado aceitável | ⚠️ |
| 7.5 | Limite de stake na casa | ○ |

---

## 8. Bilhete (se múltipla)

| # | Item | Crítico |
|---|------|---------|
| 8.1 | Correlação entre pernas avaliada | ✅ |
| 8.2 | Máx. 2 pernas ++ correlacionadas | ✅ |
| 8.3 | Stake total ≤ % bankroll | ✅ |

---

## 9. Modelo Soccer Analytics

| # | Item | Crítico |
|---|------|---------|
| 9.1 | Analysis Engine executado | ✅ |
| 9.2 | Stats source = `computed` (não fallback) | ⚠️ |
| 9.3 | Player Engine para props (se aplicável) | ⚠️ |
| 9.4 | Snapshot salvo para backtest | ○ |

---

## 10. Decisão final

| Resultado | Condição |
|-----------|----------|
| **BET** | Sem ❌ · EV > 5% · Score IA ≥ 70 |
| **WATCH** | EV 0–5% ou Score 55–69 |
| **SKIP** | EV < 0 ou ❌ bloqueante ou Score < 55 |

---

## Template de registro (IA)

```yaml
fixture_id: "abc123"
checklist:
  escalacao: ok
  lesoes: atencao  # zagueiro titular fora
  xg_forma: ok
  ev: 0.082
  score_ia: 76
decision: BET
mercado: "Over 2.5"
notas: "Casa xG 1.8 últimos 10; visitante xGA 1.9"
```

---

## Referências

- [indicadores.md](./indicadores.md)
- [value-bet.md](./value-bet.md)
- [score.md](./score.md)
