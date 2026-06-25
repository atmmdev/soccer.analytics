import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { DataEngineModule } from '../engines/data-engine/data-engine.module';

@Module({
  imports: [DataEngineModule],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}
