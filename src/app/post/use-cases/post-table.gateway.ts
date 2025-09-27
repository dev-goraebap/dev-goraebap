import { PaginationModel } from "src/app/_concern";
import { PostEntity } from "../domain";
import { GetAdminPostsDto } from "./dto/get-admin-posts.dto";

export const POST_TABLE_GATEWAY = Symbol('POST_TABLE_GATEWAY');

export interface IPostTableGateway {
  findAdminPostsWithPagination(dto: GetAdminPostsDto): Promise<PaginationModel<PostEntity>>;
}