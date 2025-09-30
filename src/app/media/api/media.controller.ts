import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AdminAuthGuard, CurrentUser } from 'src/common';
import { SelectUser } from 'src/shared/drizzle';
import { MediaUploadResponseDto } from '../dto/media-upload-response.dto';
import { MediaApplicationService } from '../media-application.service';

@Controller('/api/v1/admin/media')
@UseGuards(AdminAuthGuard)
export class AdminMediaApiController {
  constructor(
    private readonly mediaApplicationService: MediaApplicationService,
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

    return this.mediaApplicationService.uploadFile(user.id, file);
  }
}