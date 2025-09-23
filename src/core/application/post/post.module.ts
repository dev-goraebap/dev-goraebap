import { Module } from '@nestjs/common';

import { ApplicationConcernModule } from '../_concern';
import { PostCommandService } from './orchestrators/post-command.service';
import { PostQueryService } from './orchestrators/post-query.service';
import { PostPatchNotesService } from './services/post-patch-notes.service';

const services = [
  PostPatchNotesService,
  PostQueryService,
  PostCommandService,
];

@Module({
  imports: [
    ApplicationConcernModule
  ],
  providers: [
    ...services
  ],
  exports: [
    ...services
  ],
})
export class PostModule { }