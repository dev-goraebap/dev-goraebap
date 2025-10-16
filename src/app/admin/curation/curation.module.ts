import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CurationQueryService } from 'src/infra/queries/curation-query.service';
import { LoggerService } from 'src/shared/logger';
import { CurationSchedulerService } from 'src/features/services';
import { AdminCurationController } from './curation.controller';
import { CurationApplicationService } from './curation-application.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AdminCurationController],
  providers: [
    CurationApplicationService,
    CurationQueryService,
    CurationSchedulerService,
    LoggerService,
  ],
  exports: [CurationApplicationService],
})
export class CurationModule { }
