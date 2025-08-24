import { Module } from '@nestjs/common';

import { CommentsSharedService, PostsSharedService } from 'src/shared';
import { PatchNotesController } from './patch-notes.controller';
import { PatchNotesService } from './patch-notes.service';

@Module({
  controllers: [PatchNotesController],
  providers: [PatchNotesService, PostsSharedService, CommentsSharedService],
})
export class PatchNotesModule {}
