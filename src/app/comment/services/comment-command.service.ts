import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { comments, DRIZZLE, DrizzleOrm, posts } from 'src/shared/drizzle';
import { LoggerService } from 'src/shared/logger';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentCommandService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly logger: LoggerService
  ) { }

  async create(requestId: string, postSlug: string, dto: CreateCommentDto) {
    // 1. 게시물 조회 및 검증
    const post = await this.drizzle.query.posts.findFirst({
      where: eq(posts.slug, postSlug)
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    try {
      return (
        await this.drizzle
          .insert(comments)
          .values({
            requestId,
            postId: post.id,
            ...dto,
          }).returning()
      )[0];
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}