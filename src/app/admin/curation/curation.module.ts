import { Module } from '@nestjs/common';
import { CurationQueryService } from 'src/infra/queries/curation-query.service';
import { LoggerService } from 'src/shared/logger';
import { AdminCurationController } from './curation.controller';
import { CurationApplicationService } from './curation-application.service';

@Module({
  controllers: [AdminCurationController],
  providers: [
    CurationApplicationService,
    CurationQueryService,
    LoggerService,
  ],
  exports: [CurationApplicationService],
})
export class CurationModule { }
