import { Module } from '@nestjs/common';
import { SimulationEngineService } from './simulation-engine.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SimulationEngineService],
  exports: [SimulationEngineService],
})
export class SimulationEngineModule {}
