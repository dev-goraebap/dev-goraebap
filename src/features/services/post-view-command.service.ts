import { Inject, Injectable, Logger } from "@nestjs/common";
import { POST_REPO, PostRepository } from "src/domain/post";

@Injectable()
export class PostViewCommandService {
  private readonly logger = new Logger(PostViewCommandService.name);

  constructor(
    @Inject(POST_REPO)
    private readonly postRepository: PostRepository
  ) { }

  async increment(slug: string): Promise<void> {
    try {
      const post = await this.postRepository.findBySlug(slug);

      if (!post) {
        this.logger.warn(`Post not found for slug: ${slug}`);
        return;
      }

      const updatedPost = post.incrementViewCount();
      await this.postRepository.save(updatedPost);
    } catch (error) {
      // 조회수 증가 실패해도 페이지는 표시되어야 하므로 로그만 남김
      this.logger.error(`Failed to increment view count for slug: ${slug}`, error);
    }
  }
}
