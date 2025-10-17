import { Module } from '@nestjs/common';

import { CuratedSourcesCommandService } from './curated-sources-command.service';
import { AdminCuratedSourcesController } from './curated-sources.controller';
import { CurationSchedulerService } from './curation-scheduler.service';

@Module({
  imports: [],
  controllers: [AdminCuratedSourcesController],
  providers: [CuratedSourcesCommandService, CurationSchedulerService]
})
export class AdminCuratedSourcesModule { }
