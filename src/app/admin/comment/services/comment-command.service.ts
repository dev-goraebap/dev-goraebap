import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { comments, DRIZZLE, DrizzleOrm } from 'src/shared/drizzle';
import { LoggerService } from 'src/shared/logger';

@Injectable()
export class CommentCommandService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly logger: LoggerService
  ) { }

  async banComment(id: number) {
    // 1. 댓글 조회 및 검증
    const comment = await this.drizzle.query.comments.findFirst({
      where: eq(comments.id, id)
    })
    if (!comment) {
      throw new BadRequestException('댓글을 찾을 수 없습니다.');
    }

    // 2. 댓글 차단
    try {
      return (
        await this.drizzle
          .update(comments)
          .set({
            deletedAt: new Date().toISOString()
          })
          .where(eq(comments.id, comment.id))
          .returning()
      )[0]
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}