import { Module } from "@nestjs/common";

import { FeatureCommentModule } from "src/features/comment";
import { FeaturePostModule } from "src/features/post";
import { PatchNoteQueryService } from "./services/patch-note-query.service";
import { PatchNoteController } from "./web/patch-notes.controller";

@Module({
  imports: [FeaturePostModule, FeatureCommentModule],
  controllers: [PatchNoteController],
  providers: [PatchNoteQueryService]
})
export class PatchNoteModule {}