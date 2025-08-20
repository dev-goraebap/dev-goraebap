import { Module } from '@nestjs/common';

import { PostsSharedService } from 'src/shared';
import { ChangelogsController } from './changelogs.controller';
import { ChangelogsService } from './changelogs.service';

@Module({
  controllers: [ChangelogsController],
  providers: [ChangelogsService, PostsSharedService],
})
export class ChangelogsModule {}
