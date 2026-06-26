import { Module } from '@nestjs/common';
import { PlayerEngineService } from './player-engine.service';

@Module({
  providers: [PlayerEngineService],
  exports: [PlayerEngineService],
})
export class PlayerEngineModule {}
