import { Controller, Get, Post, Body } from '@nestjs/common';
import { FileCleanupService } from './services/file-cleanup.service';

@Controller({ path: 'api/admin/file-upload-test' })
export class FileUploadTestController {
  constructor(private readonly fileCleanupService: FileCleanupService) {}

  @Get('health')
  health() {
    return { status: 'OK', message: 'File upload API is running' };
  }

  @Get('orphan-files')
  async getOrphanFiles() {
    const orphanBlobs = await this.fileCleanupService.findOrphanBlobs();
    return {
      count: orphanBlobs.length,
      files: orphanBlobs.map(blob => ({
        id: blob.id,
        key: blob.key,
        filename: blob.filename,
        createdAt: blob.createdAt,
      })),
    };
  }

  @Post('cleanup')
  async manualCleanup() {
    const result = await this.fileCleanupService.manualCleanup();
    return {
      message: 'Manual cleanup completed',
      ...result,
    };
  }
}