import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { blockedIps, DRIZZLE, DrizzleOrm, SelectBlockedIp } from 'src/shared/drizzle';
import { CreateBlockedIpDto } from '../dto/create-blocked-ip.dto';

@Injectable()
export class BlockedIpCommandService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
  ) { }

  async createBlockedIp(dto: CreateBlockedIpDto): Promise<SelectBlockedIp> {
    try {
      return (
        await this.drizzle.insert(blockedIps).values({
          ...dto,
          expiresAt: null,
        }).returning()
      )[0];
    } catch (err: any) {
      throw new BadRequestException(err.cause?.detail);
    }
  }

  async unblockIp(id: number): Promise<void> {
    const blockedIp = await this.drizzle.query.blockedIps.findFirst({
      where: eq(blockedIps.id, id)
    });
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }

    try {
      await this.drizzle
        .update(blockedIps)
        .set({
          isActiveYn: 'N',
        })
        .where(eq(blockedIps.id, id));
    } catch (err) {
      throw new BadRequestException(err.cause?.detail);
    }
  }

  async makePermanentBlock(id: number): Promise<void> {
    const blockedIp = await this.drizzle.query.blockedIps.findFirst({
      where: eq(blockedIps.id, id)
    });
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }

    try {
      await this.drizzle
        .update(blockedIps)
        .set({
          expiresAt: null,
          isActiveYn: 'N',
        })
        .where(eq(blockedIps.id, id));
    } catch (err) {
      throw new BadRequestException(err.cause?.detail);
    }
  }

  async removeBlockedIp(id: number): Promise<void> {
    const blockedIp = await this.drizzle.query.blockedIps.findFirst({
      where: eq(blockedIps.id, id)
    });
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }

    try {
      await this.drizzle
        .delete(blockedIps)
        .where(eq(blockedIps.id, id));
    } catch (err) {
      throw new BadRequestException(err.cause?.detail);
    }
  }
}