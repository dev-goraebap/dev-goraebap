import { Inject, Injectable } from "@nestjs/common";

import { DRIZZLE, DrizzleOrm } from "../drizzle.module";

@Injectable()
export class PostRepository {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) {}
}