import { BadRequestException, Injectable } from "@nestjs/common";

import { CurationItemEntity } from "src/domain/curation";
import { LoggerService } from "src/shared/logger";

@Injectable()
export class CuratedItemsCommandService {

  constructor(
    private readonly logger: LoggerService
  ) { }

  async destroyItem(itemId: number): Promise<void> {
    const item = await CurationItemEntity.findById(itemId);
    if (!item) {
      throw new BadRequestException('항목을 찾을 수 없습니다.');
    }

    await CurationItemEntity.deleteById(itemId);
  }

  /**
   * N일 이전의 오래된 항목 삭제
   * @param days 일수
   * @returns 삭제된 개수
   */
  async cleanupOldItems(days: number): Promise<number> {
    const deletedCount = await CurationItemEntity.deleteOldItems(days);
    this.logger.info(`[Curation] Deleted ${deletedCount} items older than ${days} days`);
    return deletedCount;
  }
}