import { BadRequestException } from '@nestjs/common';
import { validateAndExtractContent } from 'src/shared/utils';

export class PostContentVO {
  readonly htmlContent: string;
  readonly title: string;
  readonly summary: string;

  constructor(htmlContent: string) {
    if (!htmlContent?.trim()) {
      throw new BadRequestException('컨텐츠는 필수입니다.');
    }

    const validation = validateAndExtractContent(htmlContent);

    if (!validation.isValid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    this.htmlContent = htmlContent.trim();
    this.title = validation.title;
    this.summary = validation.summary;
  }

  toString(): string {
    return this.htmlContent;
  }
}