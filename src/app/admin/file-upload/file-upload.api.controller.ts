import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors,
  BadRequestException, 
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AdminAuthGuard } from 'src/common';
import { FileUploadService } from './services/file-upload.service';
import { FileUploadResponseDto } from './dto/file-upload-response.dto';

@Controller({ path: 'api/admin/file-upload' })
@UseGuards(AdminAuthGuard)
export class FileUploadApiController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('파일이 필요합니다.');
    }

    return this.fileUploadService.uploadFile(file);
  }
}
