import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';

import { UserEntity } from 'src/shared';
import { FileUploadResponseDto } from './dto/file-upload-response.dto';
import { FileUploadService } from './services/file-upload.service';
import { GoogleVisionService } from './services/google-vision.service';
import { R2Service } from './services/r2.service';

@Injectable()
export class FileUploadApplicationService {
  private readonly logger = new Logger(FileUploadApplicationService.name);

  constructor(
    private readonly r2Service: R2Service,
    private readonly googleVisionService: GoogleVisionService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async uploadFile(user: UserEntity, file: Express.Multer.File): Promise<FileUploadResponseDto> {
    // 1단계: 파일 검증
    this.validateFile(file);

    // 2단계: 파일 전처리
    const key = this.generateKey();
    const checksum = this.calculateChecksum(file.buffer);
    const metadata = await this.extractMetadata(file);

    try {
      // 3단계: 중복 파일 확인
      const existingBlob = await this.fileUploadService.findBlobByChecksum(checksum);
      if (existingBlob) {
        // 기존 파일이 있으면 새로 업로드하지 않고 기존 blob 반환
        this.logger.log(`기존 파일 재사용: ${existingBlob.filename} (checksum: ${checksum})`);
        return {
          blobId: existingBlob.id,
          key: existingBlob.key,
          filename: existingBlob.filename,
          contentType: existingBlob.contentType,
          byteSize: existingBlob.byteSize,
          url: this.r2Service.getPublicUrl(existingBlob.key),
          metadata: existingBlob.metadata,
        };
      }

      // 4단계: R2 업로드 (새로운 파일인 경우에만)
      await this.r2Service.uploadFile(key, file.buffer, file.mimetype);

      // 5단계: DB 저장
      const savedBlob = await this.fileUploadService.createBlob(key, file, checksum, metadata, user);

      // 6단계: 응답 반환
      return {
        blobId: savedBlob.id,
        key: savedBlob.key,
        filename: savedBlob.filename,
        contentType: savedBlob.contentType,
        byteSize: savedBlob.byteSize,
        url: this.r2Service.getPublicUrl(savedBlob.key),
        metadata: savedBlob.metadata,
      };
    } catch (error) {
      // 업로드 실패 시 R2에서 파일 삭제 시도
      try {
        await this.r2Service.deleteFile(key);
      } catch (deleteError) {
        this.logger.error('Failed to cleanup file after upload failure', deleteError);
      }
      throw error;
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('파일 크기는 10MB를 초과할 수 없습니다.');
    }

    // 허용된 MIME 타입 체크
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('지원하지 않는 파일 형식입니다.');
    }
  }

  private generateKey(): string {
    return randomUUID().replace(/-/g, '');
  }

  private calculateChecksum(buffer: Buffer): string {
    return createHash('md5').update(buffer).digest('hex');
  }

  private async extractMetadata(file: Express.Multer.File): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};

    // 이미지 파일인 경우 메타데이터 추출
    if (file.mimetype.startsWith('image/')) {
      metadata.type = 'image';

      // 지배적 색상 추출
      const colorData = await this.googleVisionService.extractColors(file.buffer);
      metadata.dominantColor = colorData[0] ? colorData[0].hex : null;
      metadata.dominantColor2 = colorData[1] ? colorData[1].hex : null;
    }

    return metadata;
  }
}
