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
import { UserEntity } from 'src/shared';
import { FileUploadResponseDto } from './dto/file-upload-response.dto';
import { FileUploadService } from './services/file-upload.service';

@Controller({ path: 'api/admin/file-upload' })
@UseGuards(AdminAuthGuard)
export class FileUploadApiController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('파일이 필요합니다.');
    }

    return this.fileUploadService.uploadFile(user, file);
  }
}
