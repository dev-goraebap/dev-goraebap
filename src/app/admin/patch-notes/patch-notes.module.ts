import { Module } from '@nestjs/common';
import { PatchNotesController } from './patch-notes.controller';

@Module({
  controllers: [PatchNotesController],
})
export class PatchNotesModule {}
