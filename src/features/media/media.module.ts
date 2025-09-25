import { Module } from "@nestjs/common";
import { FileAttachmentService } from "./file-attachment.service";

@Module({
  providers: [FileAttachmentService],
  exports: [FileAttachmentService]
})
export class FeatureMediaModule {}