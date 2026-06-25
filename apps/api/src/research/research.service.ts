import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SimulationEngineService,
  StrategyFilters,
} from '../engines/simulation-engine/simulation-engine.service';
import { CreateStrategyDto } from './dto/research.dto';

@Injectable()
export class ResearchService {
  constructor(
    private prisma: PrismaService,
    private simulationEngine: SimulationEngineService,
  ) {}

  async findAll() {
    return this.prisma.researchStrategy.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        simulations: { orderBy: { executedAt: 'desc' }, take: 1 },
      },
    });
  }

  async findOne(id: string) {
    const strategy = await this.prisma.researchStrategy.findUnique({
      where: { id },
      include: {
        simulations: { orderBy: { executedAt: 'desc' } },
      },
    });
    if (!strategy) throw new NotFoundException('Estratégia não encontrada');
    return strategy;
  }

  async create(dto: CreateStrategyDto) {
    return this.prisma.researchStrategy.create({
      data: {
        name: dto.name,
        description: dto.description,
        filters: dto.filters as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.researchStrategy.delete({ where: { id } });
    return { deleted: true };
  }

  async runSimulation(id: string) {
    const strategy = await this.findOne(id);
    const filters = strategy.filters as unknown as StrategyFilters;
    const result = this.simulationEngine.simulate(filters);

    const simulation = await this.prisma.simulation.create({
      data: {
        strategyId: id,
        results: result as unknown as Prisma.InputJsonValue,
      },
    });

    await this.prisma.researchStrategy.update({
      where: { id },
      data: { results: result as unknown as Prisma.InputJsonValue },
    });

    return { simulation, result };
  }

  async runPreview(filters: StrategyFilters) {
    return this.simulationEngine.simulate(filters);
  }
}
