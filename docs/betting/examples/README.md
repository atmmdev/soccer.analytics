# Exemplos de Bilhetes

> Casos práticos com justificativa analítica, EV, Score IA e gestão de risco.

## Perfis clássicos (documentação analítica)

| Arquivo | Perfil | Odd típica | Stake |
|---------|--------|------------|-------|
| [bilhete-conservador.md](./bilhete-conservador.md) | Baixo risco | 1,40 – 2,00 | 1–2% |
| [bilhete-moderado.md](./bilhete-moderado.md) | Risco médio | 4,00 – 6,00 | 1–1,5% |
| [bilhete-agressivo.md](./bilhete-agressivo.md) | Alto risco | 15,00+ | 0,5% |
| [bilhete-placares.md](./bilhete-placares.md) | Placar exato | 6,00+ | 0,25% |
| [bilhete-jogadores.md](./bilhete-jogadores.md) | Props marcador | 2,00 – 5,00 | 0,5–1% |

## Perfis operacionais (6 bilhetes — playbook)

| # | Perfil | Objetivo | Ver |
|---|--------|----------|-----|
| 01 | Seguro | 1X2 conservador | [bilhete-variacoes-brasileirao.md](./bilhete-variacoes-brasileirao.md) |
| 02 | Médio | Hedge com empate | idem |
| 03 | Equilibrado | Resultado direto | idem |
| 04 | Variação | Alternância mandante/visitante | idem |
| 05 | Agressivo | Placares exatos | idem + [bilhete-placares.md](./bilhete-placares.md) |
| 06 | Proteção | DC / favorito | idem |

Matriz completa de rodada Brasileirão: [bilhete-variacoes-brasileirao.md](./bilhete-variacoes-brasileirao.md).

## Estrutura comum

Cada exemplo inclui:

1. Composição com EV e Score IA por perna
2. Estatísticas (xG, forma, H2H)
3. Riscos e mitigação
4. Análise de correlação
5. Checklist pré-jogo + gate [4/7](../ai/marcado-de-atuacao.md)
6. Referências aos mercados documentados

## Como usar com IA

Indexar estes arquivos como **few-shot examples** para o Ticket Builder e agentes de sugestão.
