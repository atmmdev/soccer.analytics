import { MarketType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MARKETS: Array<{ type: MarketType; name: string; description: string }> = [
  { type: MarketType.MATCH_RESULT, name: 'Resultado Final', description: '1X2' },
  { type: MarketType.BTTS, name: 'Ambas Marcam', description: 'BTTS' },
  { type: MarketType.OVER_UNDER, name: 'Total de Gols', description: 'Over/Under gols' },
  { type: MarketType.CORNERS, name: 'Escanteios', description: 'Escanteios' },
  { type: MarketType.CARDS, name: 'Cartões', description: 'Cartões' },
  { type: MarketType.HANDICAP, name: 'Handicap', description: 'Handicap asiático' },
  { type: MarketType.PLAYER, name: 'Jogador a Marcar', description: 'Anytime scorer' },
  { type: MarketType.DOUBLE_CHANCE, name: 'Chance Dupla', description: '1X / X2 / 12' },
  { type: MarketType.HT_FT, name: 'Intervalo/Final', description: 'HT/FT' },
  { type: MarketType.EXACT_SCORE, name: 'Placar', description: 'Placar exato' },
  { type: MarketType.WINNING_MARGIN, name: 'Margem de Vitória', description: 'Winning margin' },
  { type: MarketType.SHOTS, name: 'Total de Chutes', description: 'Shots O/U' },
  { type: MarketType.SHOTS_ON_TARGET, name: 'Total de Chutes ao Gol', description: 'SOT O/U' },
  { type: MarketType.RED_CARD, name: 'Cartão Vermelho', description: 'Red card' },
  { type: MarketType.BOTH_TEAMS_CARDS, name: 'Ambos Recebem Cartão', description: 'Both teams cards' },
  { type: MarketType.GOALKEEPER_SAVES, name: 'Defesas de Goleiro', description: 'Keeper saves' },
  { type: MarketType.PLAYER_SHOTS, name: 'Jogador - Chutes', description: 'Player shots' },
  {
    type: MarketType.PLAYER_SHOTS_ON_TARGET,
    name: 'Jogador - Chutes ao Gol',
    description: 'Player SOT',
  },
  { type: MarketType.PLAYER_CARDS, name: 'Jogador - Cartão', description: 'Player card' },
  { type: MarketType.PLAYER_FOULS, name: 'Jogador - Faltas', description: 'Player fouls' },
  { type: MarketType.PLAYER_TACKLES, name: 'Jogador - Desarmes', description: 'Player tackles' },
  {
    type: MarketType.PLAYER_ASSIST_OR_GOAL,
    name: 'Jogador a Marcar ou Assistir',
    description: 'Goal or assist',
  },
  { type: MarketType.GOAL_BANDS, name: 'Faixa de Gols', description: 'Exact/range goals' },
  {
    type: MarketType.ANY_PLAYER_SCORE,
    name: 'Qualquer Jogador a Marcar',
    description: 'Any player to score',
  },
  {
    type: MarketType.ANY_PLAYER_CARD,
    name: 'Qualquer Jogador Receber Cartão',
    description: 'Any player booked',
  },
  {
    type: MarketType.HIGHEST_SCORING_HALF,
    name: 'Tempo Com Mais Gols',
    description: 'Highest scoring half',
  },
  {
    type: MarketType.TEAM_MOST,
    name: 'Time - Maior Número',
    description: 'Most corners/cards/shots',
  },
  {
    type: MarketType.TEAM_TO_SCORE,
    name: 'Time - Marcador de Gols',
    description: 'Team to score',
  },
  {
    type: MarketType.TEAM_SPECIAL,
    name: 'Time - Especiais',
    description: 'Team specials',
  },
];

async function main() {
  console.log('Seeding reference data (markets only)...');

  for (const market of MARKETS) {
    const existing = await prisma.market.findFirst({
      where: { type: market.type },
    });
    if (!existing) {
      await prisma.market.create({ data: market });
    } else if (existing.name !== market.name) {
      await prisma.market.update({
        where: { id: existing.id },
        data: { name: market.name, description: market.description },
      });
    }
  }

  console.log(`Markets ready (${MARKETS.length} types). No demo matches seeded.`);
  console.log('Use API sync or Settings to import real fixtures.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
