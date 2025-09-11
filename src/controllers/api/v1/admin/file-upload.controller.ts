import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from 'src/common';
import { AdminAuthGuard } from 'src/modules';
import { UserEntity } from 'src/shared';
import { MediaUploadService, MediaUploadResponseDto } from 'src/modules';

@Controller('/api/v1/admin/media')
@UseGuards(AdminAuthGuard)
export class AdminMediaApiController {
  constructor(
    private readonly mediaUploadService: MediaUploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    return this.mediaUploadService.uploadFile(user, file);
  }
}