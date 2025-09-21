import { Module } from '@nestjs/common';

import { TagCommandService } from './orchestrators/tag-command.service';
import { TagQueryService } from './orchestrators/tag-query.service';

const services = [
  TagQueryService,
  TagCommandService
];

@Module({
  providers: [
    ...services
  ],
  exports: [
    ...services
  ],
})
export class TagModule { }