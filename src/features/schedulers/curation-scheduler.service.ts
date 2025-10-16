import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CurationApplicationService } from 'src/app/admin/curation/curation-application.service';
import { LoggerService } from 'src/shared/logger';

@Injectable()
export class CurationSchedulerService {
  constructor(
    private readonly curationApplicationService: CurationApplicationService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 매일 자정(00:00)에 RSS 피드 자동 취합
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCuration() {
    this.logger.info('[Curation Scheduler] Starting daily RSS feed collection...');

    try {
      const result = await this.curationApplicationService.fetchAllActiveSources();

      this.logger.info(
        `[Curation Scheduler] Completed! Total new items: ${result.total}. ` +
        `Details: ${JSON.stringify(result.sources)}`
      );
    } catch (error) {
      this.logger.error(
        `[Curation Scheduler] Failed to fetch RSS feeds: ${error.message}`,
        error.stack
      );
    }
  }
}
