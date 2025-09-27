import { Injectable } from "@nestjs/common";

import { TagService } from "src/app/tag";
import { UserID } from "src/app/user";
import { TransactionContext } from "src/shared/drizzle";
import { PostService } from "../domain";
import { CreatePostDto } from "./dto/create-or-update-post.dto";

@Injectable()
export class PostApplicationService {

  constructor(
    private readonly txContext: TransactionContext,
    private readonly tagService: TagService,
    private readonly postService: PostService,
  ) {}

  async createPost(userId: UserID, dto: CreatePostDto) {
    return await this.txContext.runInTransaction(async () => {
      // 1. 게시물 생성
      const createdPost = await this.postService.create({
        ...dto,
        userId
      });

      // 2. 태그 연결 (optional)
      if (dto.tags && dto.tags.length > 0) {
        const tags = await this.tagService.creates(userId, dto.tags);
        await this.postService.attachTags(createdPost, tags);
      }

      // 3. 썸네일 첨부 (optional)
      // if (dto.thumbnailBlobId) {
      //   await this.fileAttachmentService.createThumbnailAttachment(
      //     dto.thumbnailBlobId,
      //     createdPost.id.toString(),
      //     'post',
      //   );
      // }

      // // 4. 콘텐츠 이미지 첨부 (optional)
      // await this.fileAttachmentService.createContentImageAttachments(
      //   dto.content,
      //   createdPost.id.toString(),
      //   'post'
      // );

      return createdPost;
    });
  }

  updatePost() { }
}