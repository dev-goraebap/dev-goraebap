import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { PatchNotesModule } from "./patch-notes/patch-notes.module";
import { PostsModule } from "./posts/posts.module";
import { SeriesModule } from "./series/series.module";
import { TagsModule } from "./tags/tags.module";

@Module({
  imports: [
    PostsModule,
    TagsModule,
    SeriesModule,
    PatchNotesModule
  ],
  controllers: [AdminController]
})
export class AdminModule {}