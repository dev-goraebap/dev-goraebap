import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { LoggerService } from 'src/shared/logger';
import { CurationApplicationService } from './curation-application.service';
import { AdminCurationController } from './curation.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AdminCurationController],
  providers: [
    CurationApplicationService,
    LoggerService,
  ],
  exports: [CurationApplicationService],
})
export class CurationModule { }
