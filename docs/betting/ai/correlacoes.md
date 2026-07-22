# Correlações entre Mercados

> Mapa de dependências para montagem de bilhetes e modelos de IA

---

## Objetivo

Mercados no mesmo jogo **não são independentes**. Correlação **positiva** amplifica risco em múltiplas; **negativa** pode diversificar. Agentes de IA devem validar bilhetes antes de sugerir.

---

## Tipos de correlação

| Tipo | Símbolo | Efeito em múltipla |
|------|---------|-------------------|
| Positiva forte | ++ | Risco concentrado |
| Positiva moderada | + | Atenção |
| Neutra | 0 | Mais independente |
| Negativa | − | Diversificação parcial |

---

## Cadeias causais (dezenas de exemplos)

### Ataque e gols

1. **Favorito pressionando** → **+Over gols** → **+BTTS** (se visitante contra-ataca)
2. **Favorito dominante em casa** → **+Casa 1X2** → **+Over escanteios favorito**
3. **Jogo aberto (xG alto ambos)** → **+Over 2.5** → **+Over escanteios** → **+Over cartões**
4. **Time perdendo** → **+substituições ofensivas** → **+Over chutes 2º tempo**
5. **Zebra defendendo** → **+Under gols** → **+Over escanteios favorito** → **+Under chutes zebra**

### Escanteios

6. **Favorito atacando** → **+Escanteios** → **+Chutes bloqueados** → **+Defesas goleiro**
7. **Bloco baixo adversário** → **+Escanteios** → **+Posse favorito** → **-Escanteios adversário**
8. **Over escanteios** → **+Over chutes** (correlação moderada +)
9. **Escanteios 1º tempo altos** → **+cansaço** → **+cartões 2º tempo** (fraca +)

### Chutes e goleiro

10. **Muitos chutes** → **+SOT** → **+Defesas goleiro** → **+Tiros de meta**
11. **Chutes de fora da área** → **-SOT** → **+rebotes** → **escanteios** (cadeia)
12. **Goleiro xSV alto** → **+Under gols** apesar de **+Over chutes**

### Cartões e faltas

13. **Derby / rivalidade** → **+Cartões** → **+Faltas** → **+Interrupções** → **-Ritmo** → **-Over gols** (negativa entre cartões e gols em alguns jogos)
14. **Árbitro cartão-fácil** → **+Cartões** → **+Jogador recebe cartão**
15. **Jogo tenso (mata-mata)** → **+Cartões** → **+Acréscimos**

### Posse e ritmo

16. **Alta posse** → **+Passes** → **+Escanteios** (se defesa compacta)
17. **Posse sem profundidade** → **+Passes** → **-xG** → **-Over gols**
18. **Contra-ataque eficiente** → **-Posse** → **+xG por posse** → **+BTTS**

### Marcadores e resultado

19. **Casa vence** → **+Casa marcou** → correlaciona com **anytime scorer casa**
20. **0-0** → **-BTTS** → **-Over** → **-Anytime todos marcadores**
21. **Hat-trick** → **+Over gols** → **+Vitória time do jogador** (forte +)

### Tempo

22. **Gols 1º tempo** → **+abertura 2º** → **+Over 2º tempo**
23. **0-0 HT** → **+Over 2º tempo** (times pressionam) em certos perfis
24. **Casa marca cedo** → **+visitante ataca** → **+BTTS 2º tempo**

### Handicap e totais

25. **Casa -1.5 GREEN** → implica **≥2 gols de diferença** → **+Over gols quase certo**
26. **Under 1.5** → **-BTTS** → **-Over escanteios** (jogo fechado)
27. **Asian Handicap -0.5 Casa** + **Under 2.5** → correlação negativa moderada

### Clima e contexto

28. **Chuva forte** → **-Passes certos** → **+Erros** → **+Cartões** → **-Over gols**
29. **Calor extremo** → **-Intensidade 2º tempo** → **-Over 2º tempo**
30. **Rotação** → **-xG** → **-Confiança em favorito** → **+Empate**

### Especiais

31. **Impedimentos altos** → **linha alta** → **jogo com defesas altas** → **-Over gols**
32. **Tiros de meta altos** → **pressão alta** → **+Escanteios**
33. **Pênalti marcado** → **+Cartão** (às vezes) → **+Gol** → afeta múltiplas pernas

### Combinações operacionais fortes (playbook)

Pares validados operacionalmente — correlacionados **+** a **++**; usar com penalidade no Score IA:

| Combinação | Narrativa | Correlação |
|------------|-----------|------------|
| **Over 1.5 FT + BTTS** | Jogo aberto com ambos marcando | ++ |
| **Over 2.5 FT + BTTS** | Jogo franco | ++ |
| **SOT Over + Over 1.5 FT** | Volume chutes → gols | + |
| **Over 0.5 HT + Over 1.5 FT** | Ritmo desde o início | ++ |
| **Escanteios Over + SOT Over** | Pressão pelos lados | + |
| **BTTS + Over 2.5** | Máxima abertura | ++ |
| **Dupla chance + Over 1.5** | Favorito + gols | + |

Critérios de elegibilidade por perna: [marcado-de-atuacao.md](./marcado-de-atuacao.md) · perfil de liga: [ligas.md](./ligas.md).

---

### Cadeias adicionais (34–60)

#### Pressão do favorito (cadeia canônica)

34. **Favorito atacando** → **+Escanteios** → **+Chutes** → **+Defesas do goleiro adversário** → **+Tiros de meta adversário** → **−Posse adversária**
35. **Favorito −1.5** → implica margem ≥ 2 gols → **+Over 1.5** quase certo → **+Casa marca**
36. **Casa marca cedo** → visitante abre bloco → **+BTTS 2º tempo** → **+Over cartões** (pressão + faltas)

#### Props de jogador

37. **Over passes do volante** → **+Posse do time** → **−Tiros de meta do próprio goleiro**
38. **Over key passes** → **+xA** → **+Assistência** (correlação ++ se mesma partida)
39. **Anytime scorer + Over 2.5** → correlação **+** (gol do jogador conta no total)
40. **Hat-trick + Casa vence** → correlação **++**
41. **Over desarmes + Over faltas cometidas** → correlação **+** (mesmo perfil físico)
42. **Over duelos + Over recuperações** → correlação **+** (pressing)
43. **Over cabeçadas zagueiro + Over escanteios adversário** → correlação **+**

#### Live / estado do placar

44. **0-0 aos 60'** → **+Under pré-jogo fica mais favorável** · **Over live encarece**
45. **Favorito perdendo** → **+substituições ofensivas** → **+Escanteios 2º tempo** → **+Cartões**
46. **Expulsão** → **+Over gols** (em muitos perfis) → **+Handicap do time em vantagem numérica**
47. **Pênalti marcado** → **+Gol** → afeta BTTS, Over e marcador na mesma jogada

#### Clima, árbitro e contexto

48. **Árbitro cartão-fácil + derby** → **+Over cartões** → **+Acréscimos** → **−Ritmo ofensivo fluido**
49. **Chuva + vento** → **−Precisão de passe** → **−Over passes** → **+Erros** → **±Gols** (ambíguo)
50. **Calor extremo** → **−Duelos 2º tempo** → **−Over 2º tempo gols**
51. **Rotação pós-UCL** → **−xG** → **−Confiança 1X2 favorito** → **+Empate / DNB visitante**
52. **Time já classificado** → **−Motivação** → **+Under** → **−Escanteios**

#### Handicaps e totais mistos

53. **Asian −0.25 Casa + Under 2.5** → correlação **−** (vitória apertada vs poucos gols — parcial)
54. **Europeu −1 Casa + Over 2.5** → correlação **+** (precisa marcar e cobrir)
55. **BTTS Não + Under 2.5** → correlação **++**
56. **BTTS Sim + Under 1.5** → **impossível / inconsistente** — rejeitar bilhete
57. **Over escanteios time A + Under escanteios time B** → correlação **+** (mesmo jogo, lados opostos)

#### Estatísticas de equipe

58. **Over posse Casa** → **+Passes Casa** → **+Escanteios Casa** → **−Chutes perigosos se posse estéril**
59. **Over impedimentos** → linha alta defensiva → **−Over gols** (em alguns perfis) ou **+contra-ataques**
60. **Over acréscimos** → jogo truncado / VAR / cartões → **+Cartões** correlaciona **+**

---

### Combinações perigosas (evitar na mesma múltipla)

| Perna A | Perna B | Correlação |
|---------|---------|------------|
| Casa vence | Over 2.5 | + |
| Casa -1.5 | Casa vence | ++ |
| BTTS Sim | Over 2.5 | + |
| Over escanteios | Over chutes | + |
| Under 2.5 | BTTS Não | + |
| 0-0 placar | Under 0.5 1º tempo | ++ |

### Combinações com diversificação relativa

| Perna A | Perna B | Nota |
|---------|---------|------|
| Under gols | Cartões Over | Parcialmente independente |
| Casa vence | Under cartões | Negativa fraca |
| Escanteios time A | Gols time B | Mais independente |

---

## Matriz de correlação simplificada

|  | Gols O/U | BTTS | 1X2 | Escanteios | Cartões | Chutes |
|--|----------|------|-----|------------|---------|--------|
| **Gols O/U** | 1,0 | 0,6 | 0,5 | 0,4 | 0,2 | 0,5 |
| **BTTS** | 0,6 | 1,0 | 0,3 | 0,3 | 0,2 | 0,4 |
| **1X2** | 0,5 | 0,3 | 1,0 | 0,5 | 0,2 | 0,4 |
| **Escanteios** | 0,4 | 0,3 | 0,5 | 1,0 | 0,3 | 0,6 |
| **Cartões** | 0,2 | 0,2 | 0,2 | 0,3 | 1,0 | 0,3 |
| **Chutes** | 0,5 | 0,4 | 0,4 | 0,6 | 0,3 | 1,0 |

Valores: 0 = independente, 1 = mesma variável latente.

---

## Regras para Ticket Builder (IA)

1. **Máximo 2 seleções correlacionadas ++** por bilhete.
2. Penalizar Score IA em 15% por perna extra correlacionada +.
3. Preferir **simples** quando EV marginal.
4. Exibir aviso: "Mercados correlacionados — risco concentrado".

---

## Referências

- [score.md](./score.md) — penalidade de correlação
- [marcado-de-atuacao.md](./marcado-de-atuacao.md) — combinações fortes
- [ligas.md](./ligas.md) — contexto por competição
- [examples/](../examples/) — bilhetes com análise de correlação
