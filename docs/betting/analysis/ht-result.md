# Análise — Resultado 1º Tempo (HT)

> **Liquidação (SSOT):** [markets/08-primeiro-segundo-tempo.md — Resultado 1º Tempo](../markets/08-primeiro-segundo-tempo.md#resultado-1º-tempo)  
> **Pipeline:** [_pipeline.md](./_pipeline.md) · **Score:** [../ai/score.md](../ai/score.md)

## Escopo

- Casa / Empate / Fora no intervalo (1º tempo + acréscimos do HT)
- Não cobre HT/FT nem 2º tempo isolado

## Dados extras (delta vs pipeline)

| Dado | Crítico | Por quê |
|------|---------|---------|
| Gols HT médios (casa/fora) | ✅ | Ritmo de 1º tempo |
| Estilo (começa intenso vs cauteloso) | ✅ | Empates HT frequentes |
| Motivação (não tomar gol cedo) | ⚠️ | Favoritos fechados |

## Indicadores-chave

- % HT 1X2 histórico
- Gols médios 1º tempo
- Odds HT vs modelo (se houver split; senão WATCH)

## Quando utilizar

- Favorito que marca cedo com frequência
- Empate HT em jogos cautelosos com EV

## Quando evitar

- Sem estatística de período (só FT)
- Rotação / amistoso
- Engine ainda sem modelo HT dedicado → tratar como **WATCH/SKIP** até haver modelo

## Combinações

| Combo | Correlação | Nota |
|-------|------------|------|
| HT Casa + Over 0.5 HT | + | Marca no 1º |
| Empate HT + Under 2.5 FT | + | Jogo travado |
| HT Casa + Casa FT | + | Ver HT/FT |

## Score mínimo recomendado

| Ação | Score |
|------|------:|
| SKIP | < 75 ou sem modelo de período |
| WATCH | 75–86 |
| BET | ≥ 87 |

## Checklist IA (mercado)

- [ ] Dados de 1º tempo disponíveis
- [ ] EV > 0
- [ ] Score ≥ 87
- [ ] Não confundir com FT

## Decisão rápida

1. Há stats HT? 2. EV > 0? 3. Score ≥ 87 → **BET**; senão SKIP/WATCH.
