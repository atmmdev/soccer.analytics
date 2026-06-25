import { PrismaClient, MarketType, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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

  const competitions = [
    { name: 'Brasileirão Série A', country: 'Brasil' },
    { name: 'Champions League', country: 'Europa' },
    { name: 'Amistoso Internacional', country: 'Internacional' },
    { name: 'Eliminatórias UEFA', country: 'Europa' },
    { name: 'Nations League', country: 'Europa' },
  ];

  const competitionRecords = [];
  for (const comp of competitions) {
    let record = await prisma.competition.findFirst({ where: { name: comp.name } });
    if (!record) {
      record = await prisma.competition.create({ data: comp });
    }
    competitionRecords.push(record);
  }

  const teamsData = [
    { name: 'Flamengo', shortName: 'FLA', country: 'Brasil' },
    { name: 'Palmeiras', shortName: 'PAL', country: 'Brasil' },
    { name: 'Brasil', shortName: 'BRA', country: 'Brasil' },
    { name: 'Escócia', shortName: 'SCO', country: 'Escócia' },
    { name: 'França', shortName: 'FRA', country: 'França' },
    { name: 'Noruega', shortName: 'NOR', country: 'Noruega' },
    { name: 'Alemanha', shortName: 'GER', country: 'Alemanha' },
    { name: 'Itália', shortName: 'ITA', country: 'Itália' },
    { name: 'Marrocos', shortName: 'MAR', country: 'Marrocos' },
    { name: 'Tunísia', shortName: 'TUN', country: 'Tunísia' },
    { name: 'Real Madrid', shortName: 'RMA', country: 'Espanha' },
    { name: 'Barcelona', shortName: 'BAR', country: 'Espanha' },
  ];

  const teamRecords: Record<string, { id: string }> = {};
  for (const team of teamsData) {
    let record = await prisma.team.findFirst({ where: { name: team.name } });
    if (!record) {
      record = await prisma.team.create({ data: team });
    }
    teamRecords[team.name] = record;
  }

  const brasileirao = competitionRecords.find((c) => c.name.includes('Brasileirão'))!;
  const amistoso = competitionRecords.find((c) => c.name.includes('Amistoso'))!;
  const eliminatorias = competitionRecords.find((c) => c.name.includes('Eliminatórias'))!;
  const nations = competitionRecords.find((c) => c.name.includes('Nations'))!;
  const champions = competitionRecords.find((c) => c.name.includes('Champions'))!;

  const now = new Date();
  const today16h = new Date(now);
  today16h.setHours(16, 0, 0, 0);
  const today19h = new Date(now);
  today19h.setHours(19, 0, 0, 0);
  const tomorrow20h = new Date(now);
  tomorrow20h.setDate(tomorrow20h.getDate() + 1);
  tomorrow20h.setHours(20, 0, 0, 0);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(16, 0, 0, 0);

  const matches = [
    {
      homeTeamId: teamRecords['Brasil'].id,
      awayTeamId: teamRecords['Escócia'].id,
      competitionId: amistoso.id,
      matchDate: today16h,
      status: MatchStatus.SCHEDULED,
      round: 'Amistoso',
      venue: 'Estádio Nacional',
    },
    {
      homeTeamId: teamRecords['Marrocos'].id,
      awayTeamId: teamRecords['Tunísia'].id,
      competitionId: amistoso.id,
      matchDate: today16h,
      status: MatchStatus.SCHEDULED,
      round: 'Amistoso',
    },
    {
      homeTeamId: teamRecords['França'].id,
      awayTeamId: teamRecords['Noruega'].id,
      competitionId: eliminatorias.id,
      matchDate: today19h,
      status: MatchStatus.SCHEDULED,
      round: 'Rodada 5',
    },
    {
      homeTeamId: teamRecords['Alemanha'].id,
      awayTeamId: teamRecords['Itália'].id,
      competitionId: nations.id,
      matchDate: today19h,
      status: MatchStatus.SCHEDULED,
      round: 'Semifinal',
    },
    {
      homeTeamId: teamRecords['Flamengo'].id,
      awayTeamId: teamRecords['Palmeiras'].id,
      competitionId: brasileirao.id,
      matchDate: tomorrow20h,
      status: MatchStatus.SCHEDULED,
      round: 'Rodada 15',
      venue: 'Maracanã',
    },
    {
      homeTeamId: teamRecords['Real Madrid'].id,
      awayTeamId: teamRecords['Barcelona'].id,
      competitionId: champions.id,
      matchDate: tomorrow20h,
      status: MatchStatus.SCHEDULED,
      round: 'Quartas de final',
    },
    {
      homeTeamId: teamRecords['Flamengo'].id,
      awayTeamId: teamRecords['Palmeiras'].id,
      competitionId: brasileirao.id,
      matchDate: yesterday,
      status: MatchStatus.FINISHED,
      homeScore: 2,
      awayScore: 1,
      round: 'Rodada 14',
      venue: 'Maracanã',
    },
  ];

  for (const match of matches) {
    const exists = await prisma.match.findFirst({
      where: {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        matchDate: match.matchDate,
      },
    });
    if (!exists) {
      await prisma.match.create({ data: match });
    }
  }

  const marketByType = new Map(
    (await prisma.market.findMany()).map((m) => [m.type, m.id]),
  );

  const oddsTemplates: Array<{
    type: MarketType;
    selection: string;
    value: number;
  }> = [
    { type: MarketType.MATCH_RESULT, selection: 'Casa', value: 1.65 },
    { type: MarketType.MATCH_RESULT, selection: 'Empate', value: 3.6 },
    { type: MarketType.MATCH_RESULT, selection: 'Fora', value: 5.2 },
    { type: MarketType.OVER_UNDER, selection: 'Over 2.5', value: 1.85 },
    { type: MarketType.OVER_UNDER, selection: 'Under 2.5', value: 1.95 },
    { type: MarketType.BTTS, selection: 'BTTS Sim', value: 1.75 },
    { type: MarketType.BTTS, selection: 'BTTS Não', value: 2.05 },
  ];

  const scheduledMatches = await prisma.match.findMany({
    where: { status: MatchStatus.SCHEDULED },
  });

  let oddsCount = 0;
  for (const match of scheduledMatches) {
    const existingOdds = await prisma.odd.count({ where: { matchId: match.id } });
    if (existingOdds > 0) continue;

    for (const odd of oddsTemplates) {
      await prisma.odd.create({
        data: {
          matchId: match.id,
          marketId: marketByType.get(odd.type)!,
          selection: odd.selection,
          value: odd.value,
          bookmaker: 'Mock',
        },
      });
      oddsCount++;
    }
  }

  console.log(`Seeded ${markets.length} markets, ${teamsData.length} teams, ${matches.length} matches, ${oddsCount} odds`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
