/**
 * Apaga TODOS os study_tickets (e legs em cascade).
 * Uso: pnpm exec ts-node prisma/clean-study-tickets.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const legs = await prisma.studyTicketLeg.deleteMany({});
  const tickets = await prisma.studyTicket.deleteMany({});
  console.log(JSON.stringify({ deletedLegs: legs.count, deletedTickets: tickets.count }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
