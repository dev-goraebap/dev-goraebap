import { eq } from "drizzle-orm";

import { comments, DrizzleContext, SelectComment } from "src/shared/drizzle";

export type CommentID = number;

export type CreateCommentParam = {
  readonly requestId: string;
  readonly postId: number;
  readonly nickname: string;
  readonly comment: string;
  readonly avatarNo: number;
}

export class CommentEntity implements SelectComment {
  private constructor(
    readonly id: CommentID,
    readonly requestId: string,
    readonly nickname: string,
    readonly comment: string,
    readonly createdAt: string,
    readonly postId: number | null,
    readonly deletedAt: string | null,
    readonly avatarNo: number,
  ) { }

  static fromRaw(data: SelectComment): CommentEntity {
    return new CommentEntity(
      data.id,
      data.requestId,
      data.nickname,
      data.comment,
      data.createdAt,
      data.postId,
      data.deletedAt,
      data.avatarNo,
    );
  }

  static async findById(id: CommentID): Promise<CommentEntity | null> {
    const result = await DrizzleContext.db().query.comments.findFirst({
      where: eq(comments.id, id)
    });
    return result ? CommentEntity.fromRaw(result) : null;
  }

  static async create(param: CreateCommentParam): Promise<CommentEntity> {
    const [raw] = await DrizzleContext.db()
      .insert(comments)
      .values(param)
      .returning();
    return CommentEntity.fromRaw(raw);
  }

  static async ban(id: CommentID): Promise<CommentEntity> {
    const [raw] = await DrizzleContext.db()
      .update(comments)
      .set({
        deletedAt: new Date().toISOString()
      })
      .where(eq(comments.id, id))
      .returning();
    return CommentEntity.fromRaw(raw);
  }

  /**
   * 삭제 여부 확인
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
