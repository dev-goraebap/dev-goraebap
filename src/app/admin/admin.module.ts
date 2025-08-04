import { Module } from "@nestjs/common";

import { AdminController } from "./admin.controller";
import { FileUploadModule } from "./file-upload/file-upload.module";
import { PatchNotesModule } from "./patch-notes/patch-notes.module";
import { PostsModule } from "./posts/posts.module";
import { SeriesModule } from "./series/series.module";
import { TagsModule } from "./tags/tags.module";

@Module({
  imports: [
    PostsModule,
    TagsModule,
    SeriesModule,
    PatchNotesModule,
    FileUploadModule
  ],
  controllers: [AdminController]
})
export class AdminModule {}