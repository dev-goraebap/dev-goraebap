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
  constructor(
    readonly id: CommentID,
    readonly requestId: string,
    readonly nickname: string,
    readonly comment: string,
    readonly createdAt: Date,
    readonly postId: number,
    readonly deletedAt: Date | null,
    readonly avatarNo: number,
  ) { }

  static create(param: CreateCommentParam): CommentEntity {
    return new CommentEntity(
      0, // id: 0 means new entity
      param.requestId,
      param.nickname,
      param.comment,
      new Date(),
      param.postId,
      null,
      param.avatarNo,
    );
  }

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

  isNew(): boolean {
    return this.id === 0;
  }

  static async findById(id: CommentID): Promise<CommentEntity | null> {
    const result = await DrizzleContext.db().query.comments.findFirst({
      where: eq(comments.id, id)
    });
    return result ? CommentEntity.fromRaw(result) : null;
  }

  async save(): Promise<CommentEntity> {
    if (this.isNew()) {
      // INSERT
      const [raw] = await DrizzleContext.db()
        .insert(comments)
        .values({
          requestId: this.requestId,
          postId: this.postId,
          nickname: this.nickname,
          comment: this.comment,
          avatarNo: this.avatarNo,
          deletedAt: this.deletedAt || null
        })
        .returning();
      return CommentEntity.fromRaw(raw);
    } else {
      // UPDATE
      const [raw] = await DrizzleContext.db()
        .update(comments)
        .set({
          deletedAt: this.deletedAt,
        })
        .where(eq(comments.id, this.id))
        .returning();
      return CommentEntity.fromRaw(raw);
    }
  }

  ban(): CommentEntity {
    return new CommentEntity(
      this.id,
      this.requestId,
      this.nickname,
      this.comment,
      this.createdAt,
      this.postId,
      new Date(),
      this.avatarNo,
    );
  }

  /**
   * 삭제 여부 확인
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
