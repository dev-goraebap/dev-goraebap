import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlobEntity, UserEntity } from 'src/shared';
import { Repository } from 'typeorm';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobRepository: Repository<BlobEntity>,
  ) {}

  async findBlobByChecksum(checksum: string) {
    return this.blobRepository.findOne({
      where: { checksum },
    });
  }

  async createBlob(
    key: string,
    file: Express.Multer.File,
    checksum: string,
    metadata: any,
    user: UserEntity,
  ): Promise<BlobEntity> {
    const blob = this.blobRepository.create({
      key,
      filename: file.originalname,
      contentType: file.mimetype,
      serviceName: 'r2',
      byteSize: file.size,
      checksum,
      metadata,
      createdBy: user.id.toString(),
    });

    return await this.blobRepository.save(blob);
  }
}