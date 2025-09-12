import { Module } from "@nestjs/common";
import { AttachmentSharedService } from "./services/attachment-shared.service";
import { PostSharedService } from "./services/post-shared.service";
import { TagSharedService } from "./services/tags-shared.service";

const services = [
  AttachmentSharedService,
  PostSharedService,
  TagSharedService
]

@Module({
  providers: [
    ...services
  ],
  exports: [
    ...services
  ]
})
export class ApplicationConcernModule {}