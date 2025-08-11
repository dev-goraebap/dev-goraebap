import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import {
  AttachmentEntity,
  BlobEntity,
  PostEntity,
  TagEntity,
  UserEntity,
} from 'src/shared';
import { CreatePostDto } from '../dto/create-post.dto';
import {
  extractBlobIds,
  extractFirstParagraph,
} from '../utils/extract-content';

@Injectable()
export class CreatePostUseCase {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(BlobEntity)
    private readonly blobRepository: Repository<BlobEntity>,
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async execute(user: UserEntity, dto: CreatePostDto) {
    await this.entityManager.transaction(async () => {
      // 요약 텍스트 추출
      const summary = extractFirstParagraph(dto.content);

      // 태그 처리 (포스트 생성 전에)
      const existingTags = await this.tagRepository.find({
        where: { name: In(dto.tags) },
      });

      const existingTagNames = existingTags.map((tag) => tag.name);
      const newTagNames = dto.tags.filter(
        (name) => !existingTagNames.includes(name),
      );

      // 새로운 태그들 생성
      let newTags: TagEntity[] = [];
      if (newTagNames.length > 0) {
        const tagsToCreate = newTagNames.map((name) =>
          this.tagRepository.create({
            name,
            description: '', // 기본값 설정
          }),
        );
        newTags = await this.entityManager.save(tagsToCreate);
      }

      // 전체 태그 목록
      const allTags = [...existingTags, ...newTags];

      // 게시물 생성 (태그와 함께)
      const newPost = this.postRepository.create({
        user,
        title: dto.title,
        content: dto.content,
        contentHtml: dto.contentHtml,
        summary,
        isPublished: false,
        publishedAt: new Date(),
        tags: allTags, // 태그 관계 설정
      });

      await this.entityManager.save(newPost);

      // 썸네일이 있는 경우 첨부 생성
      if (dto.thumbnailBlobId) {
        const thumbnailBlob = await this.blobRepository.findOne({
          where: {
            id: dto.thumbnailBlobId,
          },
        });
        if (!thumbnailBlob) {
          throw new BadRequestException('썸네일 파일이 존재하지 않습니다.');
        }
        const newThumbnailAttachment = this.attachmentRepository.create({
          blob: thumbnailBlob,
          name: 'thumbnail',
          recordType: 'post',
          recordId: newPost.id.toString(),
        });
        await this.entityManager.save(newThumbnailAttachment);
      }

      const contentBlobIds = extractBlobIds(dto.content);

      // 게시물 컨텐츠 이미지가 있을 경우 컨텐츠 이미지 첨부 생성
      if (contentBlobIds.length !== 0) {
        const blobs = await this.blobRepository.find({
          where: {
            id: In(contentBlobIds),
          },
        });
        const newAttachments = blobs.map((x) => {
          return this.attachmentRepository.create({
            blob: x,
            name: 'contentImage',
            recordType: 'post',
            recordId: newPost.id.toString(),
          });
        });
        await this.entityManager.save(newAttachments);
      }
    });
  }
}
