import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    this.connectWhenAvailable();
  }

  private async connectWhenAvailable() {
    try {
      await this.$connect();
      this.logger.log('Database connected');
    } catch {
      this.logger.warn(
        'Database unavailable — API will run without DB. Start PostgreSQL with: pnpm docker:up',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
