import { Module } from "@nestjs/common";

import { POST_REPO } from "src/domain/post";
import { SERIES_REPO } from "src/domain/series";
import { SERIES_POST_REPO } from "src/domain/series-post";
import { PostRepositoryImpl } from "src/infra/repositories/post.repository.impl";
import { SeriesPostRepositoryImpl } from "src/infra/repositories/series-post.repository.impl";
import { SeriesRepositoryImpl } from "src/infra/repositories/series.repository.impl";
import { AdminSeriesPostsController } from "./posts.controller";
import { SeriesPostCommandService } from "./series-post-command.service";

@Module({
  controllers: [
    AdminSeriesPostsController
  ],
  providers: [
    { provide: SERIES_REPO, useClass: SeriesRepositoryImpl },
    { provide: POST_REPO, useClass: PostRepositoryImpl },
    { provide: SERIES_POST_REPO, useClass: SeriesPostRepositoryImpl },
    SeriesPostCommandService
  ],
})
export class AdminSeriesPostModule { }