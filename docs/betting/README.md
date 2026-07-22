# Betting — Documentação Oficial

> **Módulo:** Soccer Analytics · **Versão da documentação:** 1.4  
> **Público-alvo:** analistas humanos, operadores de banca, engenheiros de produto e agentes de IA  
> **Idioma:** Português (Brasil)

---

## Objetivo desta documentação

Esta documentação constitui a **base de conhecimento oficial** do módulo **Betting** do projeto **Soccer Analytics**. Ela foi projetada para:

1. **Padronizar** o entendimento de mercados de apostas esportivas em futebol.
2. **Registrar regras de liquidação** (Green, Red, Void, Push) conforme práticas de casas como a Bet365.
3. **Orientar análise pré-jogo** com indicadores estatísticos, perfis de partida e checklists.
4. **Alimentar sistemas de IA** que calculam probabilidades, EV (Expected Value), score de confiança e sugestões de mercado.
5. **Servir como referência viva** para evolução do Analysis Engine, Player Engine e Ticket Builder da plataforma.

Esta não é documentação promocional de casa de apostas. O Soccer Analytics é uma **plataforma de inteligência esportiva** — a documentação descreve mercados para **análise, modelagem e gestão de risco**, não incentivo ao jogo.

---

## Organização da documentação (SSOT)

```
docs/betting/
├── README.md
├── knowledge/     ← glossário, regras gerais
├── markets/       ← liquidação Green/Red/Void (SSOT)
├── analysis/      ← playbooks de decisão BET/WATCH/SKIP (todos os mercados)
├── ai/            ← score, EV, correlações, checklist
├── strategy/      ← live, banca (futuro)
├── examples/
└── data/          ← bilhetes reais importados

docs/prompts/          ← prompts de agentes
docs/integrations/     ← API-Football, etc.
.ai/                   ← arquitetura/engines (NÃO duplicar em docs/)
```

| Camada | Fonte canônica | Não duplicar em |
|--------|----------------|-----------------|
| Arquitetura do produto | `.ai/` | `docs/architecture/` |
| Glossário / regras gerais | `knowledge/` | `markets/` |
| Liquidação por mercado | `markets/` | `analysis/`, `ai/` |
| Como analisar / decidir | `analysis/` | `markets/` |
| Score, EV, correlação | `ai/` | `analysis/` (só limiar/delta) |
| Live / banca | `strategy/` | `ai/checklist` |
| Prompts de agentes | `docs/prompts/` | misturados em markets |
| APIs externas | `docs/integrations/` | catálogos manuais |

Plano: [PLAN-kb-betting-clean-architecture.md](../../.ai/09-development/PLAN-kb-betting-clean-architecture.md)

### Mapa de navegação

| Seção | Caminho | Conteúdo |
|-------|---------|----------|
| Glossário | [knowledge/glossary.md](./knowledge/glossary.md) | Definições de odd, stake, EV, xG, handicap, etc. |
| Regras gerais | [knowledge/rules.md](./knowledge/rules.md) | Princípios transversais de liquidação |
| **Análise (playbooks)** | [analysis/](./analysis/) | Pipeline + template + SOT, defesas, O/U gols, … |
| Resultados | [markets/01-resultados.md](./markets/01-resultados.md) | 1X2, dupla chance, handicap europeu, intervalo/final |
| Gols | [markets/02-gols.md](./markets/02-gols.md) | Over/Under, BTTS, placar exato, primeiro gol |
| Escanteios | [markets/03-escanteios.md](./markets/03-escanteios.md) | Totais, por time, asiáticos, intervalo |
| Cartões e faltas | [markets/04-cartoes-faltas.md](./markets/04-cartoes-faltas.md) | Totais, jogador, vermelho, handicap |
| Chutes | [markets/05-chutes.md](./markets/05-chutes.md) | Finalizações, no gol, bloqueadas, por tempo |
| Stats jogador | [markets/06-estatisticas-jogador.md](./markets/06-estatisticas-jogador.md) | Gols, assistências, passes, desarmes |
| Marcadores | [markets/07-marcadores.md](./markets/07-marcadores.md) | Anytime, primeiro, hat-trick |
| Tempo | [markets/08-primeiro-segundo-tempo.md](./markets/08-primeiro-segundo-tempo.md) | HT/2T, gols por período, BTTS por tempo |
| Asiáticos | [markets/09-mercados-asiaticos.md](./markets/09-mercados-asiaticos.md) | Handicap, O/U .25/.75, push, half win/loss |
| Outros | [markets/10-outros-mercados.md](./markets/10-outros-mercados.md) | Posse, especiais, promos, Bet Builder |
| IA — Score | [ai/score.md](./ai/score.md) | Escala 0–100 e pesos |
| IA — Correlações | [ai/correlacoes.md](./ai/correlacoes.md) | Dependência entre mercados |
| IA — Indicadores | [ai/indicadores.md](./ai/indicadores.md) | xG, PPDA, shots, etc. |
| IA — Checklist | [ai/checklist.md](./ai/checklist.md) | Análise pré-jogo |
| IA — Value Bet | [ai/value-bet.md](./ai/value-bet.md) | EV, edge, ROI, CLV |
| IA — Probabilidades | [ai/probabilidades.md](./ai/probabilidades.md) | Odds justas e margem |
| IA — Ligas | [ai/ligas.md](./ai/ligas.md) | Mercados por competição |
| IA — Marcado de Atuação | [ai/marcado-de-atuacao.md](./ai/marcado-de-atuacao.md) | Gate 4/7 e odds operacionais |
| IA — Apostila Camillo | [ai/apostila-camilojoga10.md](./ai/apostila-camilojoga10.md) | Base de conhecimento (guia Camillo Joga 10) |
| Dados — Bilhetes reais | [data/bilhetes/](./data/bilhetes/) | PDFs Bet365 + JSON curados em `imported/` |
| Estratégias Live | [strategy/live.md](./strategy/live.md) | Métodos in-play (Over HT, cantos) |
| Exemplos | [examples/](./examples/) | Bilhetes conservador a agressivo — ver [examples/README.md](./examples/README.md) |
| Prompts | [../prompts/](../prompts/) | Analyzer, ticket-builder, odds-evaluator, predictor |
| Integrações | [../integrations/api-football.md](../integrations/api-football.md) | Contrato API-Football |

---

## Categorias de mercados

Os mercados de futebol são agrupados em **dez categorias funcionais**. Cada categoria possui arquivo dedicado em `markets/`.

| Código | Categoria | Natureza | Exemplos |
|--------|-----------|----------|----------|
| 01 | Resultados | Desfecho da partida ou período | 1X2, Dupla Chance, Handicap Europeu |
| 02 | Gols | Contagem e distribuição de gols | Over 2.5, BTTS, Placar Exato |
| 03 | Escanteios | Eventos de bola parada lateral | Total Escanteios, Handicap Escanteios |
| 04 | Cartões e faltas | Disciplina e infrações | Over Cartões, Jogador Recebe Cartão |
| 05 | Chutes | Volume e qualidade ofensiva | Finalizações, Shots on Target |
| 06 | Estatísticas de jogador | Props individuais | Passes, Desarmes, Assistências |
| 07 | Marcadores | Quem marca gol | Anytime Scorer, Primeiro Marcador |
| 08 | Primeiro e segundo tempo | Recorte temporal | Resultado HT, Gols 1º Tempo |
| 09 | Mercados asiáticos | Linhas .25/.75, push, meio green | Handicap -0.5, Over 2.25 |
| 10 | Outros | Especiais e estatísticas raras | Posse, Bet Builder, promos, acréscimos |

### Relação com o Soccer Analytics

| Categoria | Status no Analysis Engine | Engine responsável |
|-----------|---------------------------|-------------------|
| Resultados, Gols | ✅ Modelado (Poisson) | Analysis Engine |
| Escanteios, Cartões | ✅ Modelado (Poisson O/U) | Analysis Engine |
| Handicap asiático | ✅ Modelado (matriz Poisson) | Analysis Engine |
| Marcadores | ✅ Parcial (Player Engine) | Player Engine |
| Chutes, Stats jogador, HT/2T | 🔜 Roadmap | Statistics / Player Engine |

---

## Como utilizar esta documentação

### Para analistas humanos

1. Leia o [glossário](./knowledge/glossary.md) antes de operar mercados desconhecidos.
2. Abra o arquivo da categoria desejada em `markets/` (liquidação).
3. Consulte o playbook em [`analysis/`](./analysis/) quando existir (decisão).
4. Localize o mercado pelo título (`# Nome do Mercado`).
5. Siga a seção **Checklist** antes de incluir a seleção em um bilhete.
6. Use [ai/value-bet.md](./ai/value-bet.md) para validar se há valor esperado positivo.
7. Use [examples/](./examples/) como referência de montagem e correlação.

### Para agentes de IA

1. **Ingestão:** indexar todos os arquivos `.md` como knowledge base.
2. **Pré-análise:** executar [ai/checklist.md](./ai/checklist.md) e [ai/marcado-de-atuacao.md](./ai/marcado-de-atuacao.md) (gate 4/7).
3. **Pipeline:** [analysis/_pipeline.md](./analysis/_pipeline.md) + playbook do mercado em `analysis/`.
4. **Contexto liga:** consultar [ai/ligas.md](./ai/ligas.md) para mercados compatíveis.
5. **Modelagem:** aplicar fórmulas de [ai/probabilidades.md](./ai/probabilidades.md) e [ai/value-bet.md](./ai/value-bet.md).
6. **Score:** calcular confiança com [ai/score.md](./ai/score.md).
7. **Correlação:** validar bilhetes com [ai/correlacoes.md](./ai/correlacoes.md) antes de sugerir combinações.
8. **Live (opcional):** regras em [strategy/live.md](./strategy/live.md).
9. **Liquidação:** usar seções **Como a Bet365 contabiliza** em `markets/` para simular backtest.
10. **Prompts:** [docs/prompts/](../prompts/) para agentes.

### Fluxo recomendado de análise

```mermaid
flowchart TD
    A[Fixture identificada] --> B[Checklist pré-jogo]
    B --> C[Coleta de indicadores]
    C --> D[Modelo de probabilidade]
    D --> E{Cálculo de EV}
    E -->|EV > threshold| F[Score IA]
    E -->|EV <= 0| G[SKIP / WATCH]
    F --> H{Correlação OK?}
    H -->|Sim| I[Sugestão BET]
    H -->|Não| J[Revisar bilhete]
```

---

## Como adicionar novos mercados

Siga este protocolo para manter consistência com a documentação existente e com o código da plataforma.

### Passo 1 — Classificar o mercado

Determine a categoria (01–10). Se não couber em nenhuma, use `10-outros-mercados.md` e avalie criação de nova categoria na próxima versão.

### Passo 2 — Documentar no Markdown

Copie o **template oficial** abaixo e preencha todas as seções. Não omita Green, Red ou Void.

```markdown
# Nome do Mercado

## O que é
...

## Como funciona
...

## Como a Bet365 contabiliza
...

## Exemplo GREEN
...

## Exemplo RED
...

## Exemplo VOID
...

## Mercados relacionados
...

## Quando utilizar
...

## Quando evitar
...

## Indicadores importantes
...

## Perfil ideal
...

## Perfil ruim
...

## Riscos
...

## Odds médias
...

## Grau de dificuldade
...

## Checklist
- [ ] ...
```

### Passo 3 — Atualizar o glossário

Novos termos devem ser adicionados em [knowledge/glossary.md](./knowledge/glossary.md) com definição, fórmula (se houver) e referência cruzada.

### Passo 4 — Playbook de análise

1. Copiar [analysis/_template.md](./analysis/_template.md).
2. Preencher delta de dados, limiar de score e checklist.
3. Indexar em [analysis/README.md](./analysis/README.md).
4. **Não** copiar tabelas Green/Red — linkar `markets/`.

### Passo 5 — Integrar à IA

| Arquivo | Ação |
|---------|------|
| `ai/indicadores.md` | Adicionar stats necessárias |
| `ai/correlacoes.md` | Mapear correlações com mercados existentes |
| `ai/score.md` | Ajustar pesos se o mercado for volátil ou líquido |
| `ai/checklist.md` | Incluir itens específicos do mercado |

### Passo 6 — Integrar ao código (quando aplicável)

1. Adicionar `MarketType` em `schema.prisma` se for mercado modelado.
2. Mapear odds em `api-football.provider.ts`.
3. Implementar probabilidade em `analysis-engine.service.ts` ou `player-engine.service.ts`.
4. Atualizar `.ai/09-development/TASKS.md`.

### Passo 7 — Revisão

- [ ] Todas as seções do template de mercado preenchidas
- [ ] Playbook em `analysis/` (se for tipável)
- [ ] Exemplos numéricos verificados
- [ ] Links cruzados no README
- [ ] Termos no glossário

---

## Convenções

### Linguagem e tom

- Português brasileiro, tom técnico e neutro.
- Evitar jargão sem definição — use o glossário.
- Diferenciar **probabilidade modelada** de **opinião subjetiva**.

### Notação de odds

- Odds em formato **decimal europeu** (ex.: `2.00`, `1.85`).
- Probabilidade implícita: `P = 1 / odd`.

### Notação de placar

- Formato `Casa-Fora` (ex.: `2-1` = mandante 2, visitante 1).
- Intervalo: `HT 1-0` = placar ao fim dos 45 min + acréscimos do 1º tempo.

### Liquidação (resultado da aposta)

| Termo | Significado |
|-------|-------------|
| **GREEN** | Aposta ganha |
| **RED** | Aposta perdida |
| **VOID** | Aposta anulada — stake devolvido |
| **PUSH** | Empate na linha (comum em asiáticos) — stake devolvido |
| **HALF WIN / HALF LOSS** | Meio green ou meio red (linhas .25/.75) |

### Grau de dificuldade

Escala usada em todos os mercados:

| Nível | Descrição |
|-------|-----------|
| Muito Baixo | Alta previsibilidade em amostras grandes (ex.: Over 0.5 gols em jogo de alta média) |
| Baixo | Mercados de favorito claro com linha conservadora |
| Médio | Maioria dos mercados principais (1X2, Over 2.5, BTTS) |
| Alto | Props de jogador, placar exato, eventos raros |
| Muito Alto | Combinações múltiplas, hat-trick, mercados promocionais |

### Referência à Bet365

As seções **Como a Bet365 contabiliza** descrevem regras **geralmente aplicáveis** na Bet365 e casas similares. Regras podem variar por jurisdição, competição ou alteração de termos. Em caso de dúvida, consulte os termos oficiais da operadora.

### Versionamento

Ao alterar regras ou adicionar mercados, incremente a versão no topo do README e registre em changelog do projeto.

#### Changelog

| Versão | Data | Alterações |
|--------|------|------------|
| **1.4** | jul/2026 | Reorganização SSOT: `knowledge/`, `analysis/`, `strategy/`; `docs/prompts/` + `docs/integrations/`; playbooks SOT, defesas, O/U gols; `analise.md` vira redirect |
| **1.3** | jul/2026 | Completar lacunas: props (passes decisivos, cabeçadas, tiros de meta goleiro, duelos, recuperações); glossário Yield/Duelo/Recuperação; cadeias 34–60 em correlações; checklist motivação/sequência; remoção de `bilhete-medio.md` vazio |
| **1.2** | jul/2026 | Integração playbook sports-trading: `ai/ligas.md`, `ai/marcado-de-atuacao.md`, `strategy/live.md`, exemplo Brasileirão 6 perfis, gate 4/7 no checklist |
| **1.1** | jul/2026 | Revisão fina: exemplos concretos em 01/02/06, seções Bet365 por mercado (06), referências cruzadas em todos os arquivos `markets/`, correção de mercados genéricos em 02 (gol cabeça, fora da área, próximo gol) |
| **1.0** | jul/2026 | Estrutura inicial: 10 categorias, glossário, ai/, examples/ |

---

## Contribuição

1. Branch a partir de `main`.
2. Edite apenas arquivos em `docs/betting/`.
3. Mantenha o template completo para cada mercado novo.
4. Pull request com descrição do mercado e impacto na IA.

---

## Referências externas

- [Opta / Stats Perform](https://www.statsperform.com/) — definições de eventos
- [FBref](https://fbref.com/) — xG e estatísticas avançadas
- Documentação interna: `.ai/07-engines/ANALYSIS_ENGINE.md`

---

*Soccer Analytics — Betting Module Documentation · Última atualização: jul/2026 · v1.4*
