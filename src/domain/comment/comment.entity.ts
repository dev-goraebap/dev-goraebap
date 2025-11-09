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
  readonly id!: CommentID;
  readonly requestId!: string;
  readonly nickname!: string;
  readonly comment!: string;
  readonly createdAt!: Date;
  readonly postId!: number;
  readonly deletedAt!: Date | null;
  readonly avatarNo!: number;

  static create(param: CreateCommentParam): CommentEntity {
    return Object.assign(new CommentEntity(), {
      id: 0, // id: 0 means new entity
      requestId: param.requestId,
      nickname: param.nickname,
      comment: param.comment,
      createdAt: new Date(),
      postId: param.postId,
      deletedAt: null,
      avatarNo: param.avatarNo,
    } satisfies Partial<CommentEntity>);
  }

  static fromRaw(data: SelectComment): CommentEntity {
    return Object.assign(new CommentEntity(), {
      id: data.id,
      requestId: data.requestId,
      nickname: data.nickname,
      comment: data.comment,
      createdAt: data.createdAt,
      postId: data.postId,
      deletedAt: data.deletedAt,
      avatarNo: data.avatarNo,
    } satisfies Partial<CommentEntity>);
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
    return Object.assign(new CommentEntity(), {
      id: this.id,
      requestId: this.requestId,
      nickname: this.nickname,
      comment: this.comment,
      createdAt: this.createdAt,
      postId: this.postId,
      deletedAt: new Date(),
      avatarNo: this.avatarNo,
    } satisfies Partial<CommentEntity>);
  }

  /**
   * 삭제 여부 확인
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
