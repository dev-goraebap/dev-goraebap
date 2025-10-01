import { BadRequestException, Injectable } from '@nestjs/common';

import { BlockedIpEntity } from 'src/domain/blocked-ip/blocked-ip.entity';
import { SelectBlockedIp } from 'src/shared/drizzle';
import { CreateBlockedIpDto } from './dto/create-blocked-ip.dto';

@Injectable()
export class BlockedIpApplicationService {
  async createBlockedIp(dto: CreateBlockedIpDto): Promise<SelectBlockedIp> {
    try {
      return await BlockedIpEntity.create({
        ...dto,
        expiresAt: null,
        isActiveYn: 'Y',
      });
    } catch (err: any) {
      throw new BadRequestException(err.cause?.detail);
    }
  }

  async unblockIp(id: number): Promise<void> {
    const blockedIp = await BlockedIpEntity.findById(id);
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }

    try {
      await BlockedIpEntity.deactivate(id);
    } catch (err: any) {
      throw new BadRequestException(err.cause?.detail);
    }
  }

  async makePermanentBlock(id: number): Promise<void> {
    const blockedIp = await BlockedIpEntity.findById(id);
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }

    try {
      await BlockedIpEntity.makePermanent(id);
    } catch (err: any) {
      throw new BadRequestException(err.cause?.detail);
    }
  }

  async removeBlockedIp(id: number): Promise<void> {
    const blockedIp = await BlockedIpEntity.findById(id);
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }

    try {
      await BlockedIpEntity.delete(id);
    } catch (err: any) {
      throw new BadRequestException(err.cause?.detail);
    }
  }
}