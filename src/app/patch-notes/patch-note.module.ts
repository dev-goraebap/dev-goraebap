import { Module } from "@nestjs/common";

import { PatchNoteController } from "./patch-note.controller";

@Module({
  imports: [],
  controllers: [PatchNoteController],
  providers: []
})
export class PatchNoteModule {}