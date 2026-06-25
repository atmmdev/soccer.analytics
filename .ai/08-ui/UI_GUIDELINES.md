# UI Guidelines

## Identidade Visual

- **Nome:** Soccer Analytics do ATM
- **Slogan:** Football Intelligence Platform
- **Tema:** Escuro (dark mode default)
- **Cor primária:** Verde esmeralda `#10B981` (emerald-500)
- **Cor secundária:** `#059669` (emerald-600)
- **Layout**: './layout.png'
- **Logo**: './logo.png'
- **Design System**: ShadcnUI

## Inspirações

- **TradingView** — widgets de dados financeiros, gráficos
- **Sofascore** — visualização de jogos, estatísticas
- **Bet365** — mercados e odds
- **FotMob** — UX mobile-first, clean

## Paleta de Cores

```css
--background: #0a0a0a;        /* zinc-950 */
--foreground: #fafafa;        /* zinc-50 */
--card: #18181b;              /* zinc-900 */
--card-foreground: #fafafa;
--primary: #10b981;           /* emerald-500 */
--primary-foreground: #ffffff;
--secondary: #27272a;         /* zinc-800 */
--muted: #3f3f46;             /* zinc-700 */
--accent: #10b981;
--destructive: #ef4444;       /* red-500 */
--border: #27272a;
--ring: #10b981;
```

## Tipografia

- **Font:** Inter (sans-serif)
- **Monospace:** JetBrains Mono (números, odds, stats)

## Componentes

### Cards de Widget (Dashboard)

```
┌─────────────────────────┐
│ 📊 ROI                  │
│                         │
│    +12.5%               │
│    ▲ 2.3% vs semana     │
│                         │
└─────────────────────────┘
```

### Match Card

```
┌─────────────────────────────────────┐
│ 🏆 Brasileirão · Round 15          │
│                                     │
│  Flamengo  2 - 1  Palmeiras  78'   │
│                                     │
│  EV+ 1.85  │  Conf: 82%  │  ▶     │
└─────────────────────────────────────┘
```

### Market Row

```
│ Over 2.5    │ 62%  │ 1.61  │ 1.85  │ +14.7%  │ 78  │ BET │
│ BTTS Yes    │ 55%  │ 1.82  │ 1.70  │ -6.6%   │ 65  │ SKIP│
```

## Layout

### Sidebar (240px)

```
┌──────────┐
│ ⚽ Logo   │
│          │
│ Dashboard│
│ Matches  │
│ Analyzer │
│ Markets  │
│ Tickets  │
│ Bankroll │
│ Research │
│          │
│ ⚙ Settings│
└──────────┘
```

### Responsivo

- Desktop: sidebar fixa + content
- Tablet: sidebar colapsável
- Mobile: bottom navigation

## Ícones

- Lucide React (padrão Shadcn)
- Emojis para competições (bandeiras)

## Gráficos (Recharts)

- Linha: evolução ROI/yield
- Barra: comparação de stats
- Radar: perfil de equipe
- Área: drawdown

## Estados

- **EV positivo:** verde (`text-emerald-500`)
- **EV negativo:** vermelho (`text-red-500`)
- **Neutro:** cinza (`text-zinc-400`)
- **Confidence alto (>70):** verde
- **Confidence médio (50-70):** amarelo
- **Confidence baixo (<50):** vermelho
