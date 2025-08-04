export class FileUploadResponseDto {
  blobId: number;
  key: string;
  filename: string;
  contentType: string;
  byteSize: number;
  url: string;
  metadata: Record<string, any>;
}