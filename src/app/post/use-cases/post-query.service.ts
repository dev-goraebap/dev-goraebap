import { Inject, Injectable } from "@nestjs/common";

import { GetAdminPostsDto } from "./dto/get-admin-posts.dto";
import { IPostTableGateway, POST_TABLE_GATEWAY } from "./post-table.gateway";

@Injectable()
export class PostQueryService {

  constructor(
    @Inject(POST_TABLE_GATEWAY)
    private readonly postTableGateway: IPostTableGateway
  ) { }

  async getAdminPostsWithPagination(dto: GetAdminPostsDto) {
    return await this.postTableGateway.findAdminPostsWithPagination(dto);
  }
}