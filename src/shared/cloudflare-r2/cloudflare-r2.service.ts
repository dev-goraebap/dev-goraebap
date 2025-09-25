import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareR2Service {
  private readonly logger = new Logger(CloudflareR2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName =
      this.configService.get('R2_BUCKET_NAME') || 'your-bucket-name';
    this.publicUrl =
      this.configService.get('R2_PUBLIC_URL') || 'https://your-public-url.com';

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
    const filePath = this.getFilePath(key);

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
    const filePath = this.getFilePath(key);

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

  /**
   * @description 엔드포인트와 파일 키를 결합하여 공개 접근 가능한 URL을 생성합니다.
   * @param endpoint 파일 서버의 기본 엔드포인트 URL (예: "https://cdn.example.com")
   * @param key 파일 키 (최소 4자리 이상)
   * @returns 디렉토리 구조가 포함된 완전한 공개 URL
   * @example
   * getPublicUrl("https://cdn.example.com", "abcd1234.jpg") // returns "https://cdn.example.com/ab/cd/abcd1234.jpg"
   */
  getPublicUrl(key: string): string {
    const filePath = this.getFilePath(key);
    return `${this.publicUrl}/${this.bucketName}/${filePath}`;
  }

  /**
   * @description 파일 키를 디렉토리 구조가 포함된 파일 경로로 변환합니다.
   * 파일 키의 처음 2자리와 3-4자리를 사용하여 2단계 디렉토리 구조를 생성합니다.
   * @param key 변환할 파일 키 (최소 4자리 이상)
   * @returns 디렉토리 구조가 포함된 파일 경로 (예: "ab/cd/abcd1234.jpg")
   * @example
   * getFilePath("abcd1234.jpg") // returns "ab/cd/abcd1234.jpg"
   */
  private getFilePath(key: string): string {
    return `${key.substring(0, 2)}/${key.substring(2, 4)}/${key}`;
  }
}