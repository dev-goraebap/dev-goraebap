import { Global, Module, Provider } from "@nestjs/common";
import { POST_REPO } from "src/domain/post";
import { BlockedIpQueryService, CommentQueryService, PostQueryService, TagQueryService } from "./queries";
import { PostRepositoryImpl } from "./repositories/post.repository.impl";

const queries = [
  BlockedIpQueryService,
  TagQueryService,
  CommentQueryService,
  PostQueryService
];

const repositories: Provider[] = [
  { provide: POST_REPO, useClass: PostRepositoryImpl }
]

@Global()
@Module({
  imports: [],
  providers: [...queries, ...repositories],
  exports: [...queries, ...repositories],
})
export class InfraModule { }