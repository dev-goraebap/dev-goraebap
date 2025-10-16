import { BadRequestException, Injectable } from '@nestjs/common';
import * as RSSParser from 'rss-parser';

import { CurationItemEntity, CurationSourceEntity } from 'src/domain/curation';
import { LoggerService } from 'src/shared/logger';
import { CreateSourceDto, UpdateSourceDto } from './dto/create-or-update-source.dto';

@Injectable()
export class CurationApplicationService {
  private readonly rssParser: RSSParser;

  constructor(
    private readonly logger: LoggerService,
  ) {
    this.rssParser = new RSSParser();
  }

  // ---------------------------------------------------------------------------
  // 소스 관리
  // ---------------------------------------------------------------------------

  async createSource(dto: CreateSourceDto): Promise<CurationSourceEntity> {
    const source = CurationSourceEntity.create({
      name: dto.name,
      url: dto.url,
      fetchIntervalMinutes: dto.fetchIntervalMinutes,
      isActiveYn: dto.isActiveYn,
    });

    return await source.save();
  }

  async updateSource(id: number, dto: UpdateSourceDto): Promise<CurationSourceEntity> {
    const existingSource = await CurationSourceEntity.findById(id);
    if (!existingSource) {
      throw new BadRequestException('소스를 찾을 수 없습니다.');
    }

    const updatedSource = existingSource.update({
      name: dto.name,
      url: dto.url,
      fetchIntervalMinutes: dto.fetchIntervalMinutes,
      isActiveYn: dto.isActiveYn,
    });

    return await updatedSource.save();
  }

  async toggleSourceActive(id: number): Promise<CurationSourceEntity> {
    const source = await CurationSourceEntity.findById(id);
    if (!source) {
      throw new BadRequestException('소스를 찾을 수 없습니다.');
    }

    const toggled = source.toggle();
    return await toggled.save();
  }

  async deleteSource(id: number): Promise<void> {
    const source = await CurationSourceEntity.findById(id);
    if (!source) {
      throw new BadRequestException('소스를 찾을 수 없습니다.');
    }

    // 관련 항목도 삭제
    await CurationItemEntity.deleteBySourceId(id);
    await CurationSourceEntity.delete(id);
  }

  // ---------------------------------------------------------------------------
  // RSS 취합
  // ---------------------------------------------------------------------------

  /**
   * 특정 소스에서 RSS 피드를 가져와 DB에 저장
   * @param sourceId 소스 ID
   * @returns 새로 추가된 항목 수
   */
  async fetchFromSource(sourceId: number): Promise<number> {
    const source = await CurationSourceEntity.findById(sourceId);
    if (!source) {
      throw new BadRequestException('소스를 찾을 수 없습니다.');
    }

    try {
      const feed = await this.rssParser.parseURL(source.url);
      let newCount = 0;

      for (const item of feed.items) {
        // guid 또는 link로 중복 체크
        const guid = item.guid || item.link || '';
        if (!guid) continue;

        const exists = await CurationItemEntity.findByGuid(guid);
        if (exists) continue;

        // 새 항목 저장
        const entity = CurationItemEntity.create({
          title: item.title || 'Untitled',
          link: item.link || '',
          guid: guid,
          snippet: item.contentSnippet?.slice(0, 500) || item.content?.slice(0, 500) || null,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: source.name,
          sourceId: source.id,
        });

        await entity.save();
        newCount++;
      }

      this.logger.info(`[Curation] Fetched ${newCount} new items from "${source.name}"`);
      return newCount;

    } catch (error) {
      this.logger.error(`[Curation] Failed to fetch from "${source.name}": ${error.message}`);
      throw new BadRequestException(`RSS 피드를 가져올 수 없습니다: ${error.message}`);
    }
  }

  /**
   * 모든 활성 소스에서 RSS 피드 취합
   * @returns 총 새로 추가된 항목 수
   */
  async fetchAllActiveSources(): Promise<{ total: number; sources: { name: string; count: number }[] }> {
    const sources = await CurationSourceEntity.findAllActive();

    const results: { name: string; count: number }[] = [];
    let total = 0;

    for (const source of sources) {
      try {
        const count = await this.fetchFromSource(source.id);
        results.push({ name: source.name, count });
        total += count;
      } catch (error) {
        this.logger.error(`[Curation] Failed to fetch from "${source.name}": ${error.message}`);
        results.push({ name: source.name, count: 0 });
      }
    }

    return { total, sources: results };
  }

  // ---------------------------------------------------------------------------
  // 항목 관리
  // ---------------------------------------------------------------------------

  async deleteItem(itemId: number): Promise<void> {
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
  async deleteOldItems(days: number): Promise<number> {
    const deletedCount = await CurationItemEntity.deleteOldItems(days);
    this.logger.info(`[Curation] Deleted ${deletedCount} items older than ${days} days`);
    return deletedCount;
  }
}
