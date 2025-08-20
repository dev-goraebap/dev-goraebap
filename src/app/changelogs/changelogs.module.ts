import { Module } from '@nestjs/common';

import { ChangelogsController } from './changelogs.controller';
import { ChangelogsService } from './changelogs.service';

@Module({
  controllers: [ChangelogsController],
  providers: [ChangelogsService],
})
export class ChangelogsModule {}
