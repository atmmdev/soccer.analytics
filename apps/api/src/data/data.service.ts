import { Injectable } from '@nestjs/common';
import { DataEngineService } from '../engines/data-engine/data-engine.service';

@Injectable()
export class DataService {
  constructor(private dataEngine: DataEngineService) {}

  getStatus() {
    return this.dataEngine.getStatus();
  }

  importFixtures(date: string) {
    return this.dataEngine.importFixtures(date);
  }

  importOdds(date: string) {
    return this.dataEngine.importOdds(date);
  }
}
