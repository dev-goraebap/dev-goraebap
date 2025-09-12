import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlockedIpEntity } from 'src/core/infrastructure/entities';
import { CreateBlockedIpDto } from '../dto/create-blocked-ip.dto';

@Injectable()
export class BlockedIpCommandService {
  constructor(
    @InjectRepository(BlockedIpEntity)
    private readonly ipBlockedRepository: Repository<BlockedIpEntity>,
  ) { }

  async createBlockedIp(dto: CreateBlockedIpDto): Promise<BlockedIpEntity> {
    const newBlockedIp = this.ipBlockedRepository.create({
      ...dto,
      expiresAt: null,
    });

    try {
      return await this.ipBlockedRepository.save(newBlockedIp);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async unblockIp(id: number): Promise<void> {
    const blockedIp = await this.ipBlockedRepository.findOne({ where: { id } });
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }
    await this.ipBlockedRepository.update(blockedIp.id, {
      isActiveYn: 'N',
    });
  }

  async makePermanentBlock(id: number): Promise<void> {
    const blockedIp = await this.ipBlockedRepository.findOne({ where: { id } });
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }
    await this.ipBlockedRepository.update(blockedIp.id, {
      expiresAt: null,
      isActiveYn: 'Y',
    });
  }

  async removeBlockedIp(id: number): Promise<void> {
    const blockedIp = await this.ipBlockedRepository.findOne({ where: { id } });
    if (!blockedIp) {
      throw new BadRequestException('IP를 찾을 수 없습니다.');
    }
    await this.ipBlockedRepository.delete(blockedIp.id);
  }
}