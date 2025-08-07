/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class GoogleVisionService {
  private readonly logger = new Logger(GoogleVisionService.name);
  private client: ImageAnnotatorClient;

  constructor() {
    // 환경변수 GOOGLE_APPLICATION_CREDENTIALS 또는 직접 keyFilename 지정 가능
    this.client = new ImageAnnotatorClient({
      // keyFilename: '경로/서비스계정.json', // 필요시 지정
      keyFilename: join(process.cwd(), '.config', 'google-vision.json'),
    });
    this.logger.debug('Init GoogleVisionService');
  }

  // 이미지에서 텍스트 추출
  async extractTextLines(buffer: Buffer): Promise<string[]> {
    try {
      const [result] = await this.client.textDetection({
        image: { content: buffer },
      });
      const annotations = result.textAnnotations;
      if (!annotations || annotations.length === 0) return [];
      
      const firstAnnotation = annotations[0];
      if (!firstAnnotation?.description) return [];
      
      return firstAnnotation.description
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean);
    } catch (e: unknown) {
      this.logger.error('Google Vision API 오류:', e);
      throw new Error('이미지 텍스트 추출 중 오류');
    }
  }

  // 이미지에서 대표 색상 추출
  async extractColors(
    buffer: Buffer,
  ): Promise<
    { hex: string; rgb: string; score: number; pixelFraction: number }[]
  > {
    try {
      const [result] = await this.client.imageProperties({
        image: { content: buffer },
      });
      const colors =
        result.imagePropertiesAnnotation?.dominantColors?.colors ?? [];
      
      return colors.map((colorInfo) => {
        const color = colorInfo.color;
        const red = (color?.red as number) ?? 0;
        const green = (color?.green as number) ?? 0;
        const blue = (color?.blue as number) ?? 0;
        
        return {
          hex: `#${this.toHex(red)}${this.toHex(green)}${this.toHex(blue)}`,
          rgb: `rgb(${red}, ${green}, ${blue})`,
          score: colorInfo.score ?? 0,
          pixelFraction: colorInfo.pixelFraction ?? 0,
        };
      });
    } catch (e: unknown) {
      this.logger.error('Google Vision 색상 추출 오류:', e);
      return [];
    }
  }

  private toHex(value: number | null | undefined): string {
    return (value ?? 0).toString(16).padStart(2, '0');
  }
}