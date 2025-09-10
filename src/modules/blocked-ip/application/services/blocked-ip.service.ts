import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlockedIpEntity } from 'src/shared';
import { CreateBlockedIpDto } from '../dto/create-blocked-ip.dto';

@Injectable()
export class BlockedIpService {
  constructor(
    @InjectRepository(BlockedIpEntity)
    private readonly ipBlockedRepository: Repository<BlockedIpEntity>,
  ) {}

  async findById(id: number): Promise<BlockedIpEntity | null> {
    return this.ipBlockedRepository.findOne({ where: { id } });
  }

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

  async unblockIp(blockedIp: BlockedIpEntity): Promise<void> {
    await this.ipBlockedRepository.update(blockedIp.id, {
      isActiveYn: 'N',
    });
  }

  async makePermanentBlock(blockedIp: BlockedIpEntity): Promise<void> {
    await this.ipBlockedRepository.update(blockedIp.id, {
      expiresAt: null,
      isActiveYn: 'Y',
    });
  }

  async removeBlockedIp(blockedIp: BlockedIpEntity): Promise<void> {
    await this.ipBlockedRepository.delete(blockedIp.id);
  }
}