import { MarketType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding reference data (markets only)...');

  const markets = [
    { type: MarketType.MATCH_RESULT, name: 'Resultado Final', description: '1X2' },
    { type: MarketType.BTTS, name: 'Ambas Marcam', description: 'BTTS' },
    { type: MarketType.OVER_UNDER, name: 'Over/Under Gols', description: 'Total de gols' },
    { type: MarketType.CORNERS, name: 'Escanteios', description: 'Escanteios' },
    { type: MarketType.CARDS, name: 'Cartões', description: 'Cartões' },
    { type: MarketType.HANDICAP, name: 'Handicap', description: 'Handicap' },
  ];

  for (const market of markets) {
    const existing = await prisma.market.findFirst({
      where: { type: market.type, name: market.name },
    });
    if (!existing) await prisma.market.create({ data: market });
  }

  console.log(`Markets ready (${markets.length} types). No demo matches seeded.`);
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
