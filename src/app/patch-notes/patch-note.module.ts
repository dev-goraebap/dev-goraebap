import { Module } from "@nestjs/common";

import { PatchNoteController } from "./patch-note.controller";

@Module({
  controllers: [PatchNoteController],
})
export class PatchNoteModule {}