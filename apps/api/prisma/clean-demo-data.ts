import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing demo/seed data (records without external_id)...');

  const demoMatches = await prisma.match.findMany({
    where: { externalId: null },
    select: { id: true },
  });

  const demoMatchIds = demoMatches.map((m) => m.id);

  if (demoMatchIds.length > 0) {
    await prisma.ticketSelection.deleteMany({
      where: { matchId: { in: demoMatchIds } },
    });
    await prisma.snapshot.deleteMany({ where: { matchId: { in: demoMatchIds } } });
    await prisma.prediction.deleteMany({ where: { matchId: { in: demoMatchIds } } });
    await prisma.odd.deleteMany({ where: { matchId: { in: demoMatchIds } } });
    await prisma.oddsHistory.deleteMany({ where: { matchId: { in: demoMatchIds } } });
    await prisma.matchStatistics.deleteMany({ where: { matchId: { in: demoMatchIds } } });
    await prisma.match.deleteMany({ where: { id: { in: demoMatchIds } } });
    console.log(`Removed ${demoMatchIds.length} demo matches`);
  } else {
    console.log('No demo matches found');
  }

  const demoTeams = await prisma.team.findMany({
    where: { externalId: null },
    select: { id: true },
  });

  for (const team of demoTeams) {
    const used = await prisma.match.count({
      where: {
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
      },
    });
    if (used === 0) {
      await prisma.team.delete({ where: { id: team.id } });
    }
  }

  const demoCompetitions = await prisma.competition.findMany({
    where: { externalId: null },
    select: { id: true },
  });

  for (const comp of demoCompetitions) {
    const used = await prisma.match.count({ where: { competitionId: comp.id } });
    if (used === 0) {
      await prisma.competition.delete({ where: { id: comp.id } });
    }
  }

  const mockOdds = await prisma.odd.deleteMany({
    where: { bookmaker: 'Mock' },
  });
  if (mockOdds.count > 0) {
    console.log(`Removed ${mockOdds.count} mock odds`);
  }

  console.log('Demo data cleanup completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
