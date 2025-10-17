import { Global, Module, Provider } from "@nestjs/common";

import { POST_REPO } from "src/domain/post";
import { SERIES_REPO } from "src/domain/series";
import { BlockedIpQueryService, CommentQueryService, CuratedItemQueryService, CuratedSourceQueryService, PostQueryService, TagQueryService } from "./queries";
import { SeriesQueryService } from "./queries/series-query.service";
import { PostRepositoryImpl } from "./repositories/post.repository.impl";
import { SeriesRepositoryImpl } from "./repositories/series.repository.impl";

const queries = [
  BlockedIpQueryService,
  TagQueryService,
  CommentQueryService,
  PostQueryService,
  SeriesQueryService,
  CuratedSourceQueryService,
  CuratedItemQueryService
];

const repositories: Provider[] = [
  { provide: POST_REPO, useClass: PostRepositoryImpl },
  { provide: SERIES_REPO, useClass: SeriesRepositoryImpl },
]

@Global()
@Module({
  imports: [],
  providers: [...queries, ...repositories],
  exports: [...queries, ...repositories],
})
export class InfraModule { }