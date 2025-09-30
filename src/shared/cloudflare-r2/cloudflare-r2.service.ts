import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { R2PathHelper } from './r2-path.helper';

@Injectable()
export class CloudflareR2Service {
  private readonly logger = new Logger(CloudflareR2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName =
      this.configService.get('R2_BUCKET_NAME') || 'your-bucket-name';
    const publicUrl =
      this.configService.get('R2_PUBLIC_URL') || 'https://your-public-url.com';

    // R2PathHelper 초기화
    R2PathHelper.configure(publicUrl, this.bucketName);

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint:
        this.configService.get('R2_ENDPOINT') ||
        'https://your-account-id.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const filePath = R2PathHelper.getFilePath(key);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${filePath}`, error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = R2PathHelper.getFilePath(key);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      throw error;
    }
  }
}