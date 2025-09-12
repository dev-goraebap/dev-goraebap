import { Module } from '@nestjs/common';

import { TagQueryService } from './orchestrators/tag-query.service';
import { TagService } from './services/tag.service';

const services = [
  TagService,
  TagQueryService,
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