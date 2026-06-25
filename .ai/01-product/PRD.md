# PRD — Product Requirements Document

## Visão do Produto

Soccer Analytics do ATM é uma plataforma de Business Intelligence aplicada ao futebol. Não é um gerador de bilhetes — é uma ferramenta de análise, experimentação e melhoria contínua baseada em dados.

## Problema

Apostadores esportivos tomam decisões sem:
- Histórico estruturado de análises
- Validação de estratégias com dados passados
- Cálculo sistemático de valor esperado
- Snapshots para medir acurácia ao longo do tempo

## Solução

Uma plataforma que:
1. Coleta e armazena dados esportivos
2. Analisa partidas com engines especializados
3. Calcula probabilidades e EV
4. Permite testar hipóteses com histórico
5. Salva snapshots para medir performance
6. Explica recomendações com IA baseada em dados

## Usuário

- **Atual:** Administrador único (você)
- **Futuro:** Potencial SaaS

## Autenticação

- Login + Senha
- JWT (15min) + Refresh Token (7 dias)
- Sem cadastro público
- Sem multiusuário
- Sem planos

## Módulos

### 1. Dashboard
Widgets inspirados em TradingView, Sofascore, Bet365, FotMob:
- Banca, ROI, Yield, EV+
- Jogos do dia
- Mercados sugeridos
- Bilhete recomendado
- Pesquisa rápida

### 2. Match Center
- Listagem de jogos
- Filtros por competição, data, status
- Detalhes da partida

### 3. Match Analyzer
Comparar últimos 5/10/15/20 jogos:
- Casa vs Fora vs H2H
- Indicadores: gols, escanteios, cartões, finalizações, posse, passes, xG, xGA

### 4. Market Analyzer
Mercados: Resultado, BTTS, Over/Under, Escanteios, Cartões, Jogadores, Handicap
Para cada: Probabilidade, Odd Justa, Odd Casa, EV, Confidence Score

### 5. Ticket Builder
- Selecionar mercados
- Calcular odd combinada, probabilidade, stake, retorno, EV
- Validar correlação entre mercados

### 6. Bankroll
- ROI, Yield, Drawdown
- Lucro/Perda
- Histórico de bilhetes

### 7. Research Lab
- Criar hipóteses
- Ex: "Over 2.5 nos últimos 500 jogos do Brasil"
- Resultado: ROI, Yield, Lucro, Drawdown, Taxa de acerto

### 8. AI Engine
- Explica recomendações
- Nunca inventa previsões
- Justifica com dados

## Snapshots (Crítico)

Toda análise salva:
- Odds no momento
- Forma das equipes
- Jogadores
- Estatísticas
- Mercados analisados
- Confidence, EV, resultado previsto

Após o jogo:
- Resultado real
- Permite medir: taxa de acerto, ROI, mercados que funcionam

## Métricas de Sucesso

- Taxa de acerto das previsões
- ROI das estratégias validadas
- Tempo para analisar um jogo
- Número de snapshots acumulados

## Fora de Escopo

- Realizar apostas
- Integração com casas de apostas
- Cadastro de usuários
- Planos/pagamentos
- App mobile (fase inicial)
