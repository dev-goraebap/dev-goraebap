import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { MediaUploadResponseDto, MediaUploadService } from 'src/core/application/media';
import { CurrentUser } from 'src/core/presentation/decorators';
import { AdminAuthGuard } from 'src/core/presentation/guards';
import { SelectUser } from 'src/shared/drizzle';

@Controller('/api/v1/admin/media')
@UseGuards(AdminAuthGuard)
export class AdminMediaApiController {
  constructor(
    private readonly mediaUploadService: MediaUploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: SelectUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    return this.mediaUploadService.uploadFile(user.id, file);
  }
}