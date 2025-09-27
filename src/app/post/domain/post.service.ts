import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { TagEntity } from "src/app/tag";
import { CreatePostParam, IPostRepository, POST_REPO, PostEntity } from "../domain";

@Injectable()
export class PostService {
  constructor(
    @Inject(POST_REPO)
    private readonly postRepository: IPostRepository
  ) { }

  async create(param: CreatePostParam) {
    const existPost = await this.postRepository.findBySlug(param.slug);
    if (existPost) {
      throw new BadRequestException('사용중인 슬러그입니다.');
    }
    const postEntity = PostEntity.create(param);
    return await this.postRepository.create(postEntity);
  }

  async updateViewCount(slug: string) {
    const post = await this.postRepository.findBySlug(slug);
    if (!post) {
      throw new BadRequestException('게시물이 존재하지 않습니다');
    }
    const updatedPost = post.withUpdateViewCount();
    await this.postRepository.update(updatedPost);
  }

  async attachTags(post: PostEntity, tags: TagEntity[]) {
    await this.postRepository.attachTags(post, tags);
  }
}