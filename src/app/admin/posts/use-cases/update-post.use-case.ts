import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { AttachmentEntity, BlobEntity, PostEntity, TagEntity } from 'src/shared';
import { UpdatePostDto } from '../dto/update-post.dto';
import {
  extractBlobIds,
  extractFirstParagraph,
} from '../utils/extract-content';

@Injectable()
export class UpdatePostUseCase {
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

  async execute(id: number, dto: UpdatePostDto) {
    await this.entityManager.transaction(async () => {
      const post = await this.postRepository.findOne({
        where: { id },
        relations: {
          tags: true,
        },
      });
      if (!post) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 요약 텍스트 추출
      const summary = extractFirstParagraph(dto.content);

      // 태그 처리 (생성과 동일한 로직)
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
            description: '',
          }),
        );
        newTags = await this.entityManager.save(tagsToCreate);
      }

      // 전체 태그 목록
      const allTags = [...existingTags, ...newTags];

      // 게시물 업데이트 (태그 관계도 함께)
      const updatedPost = this.postRepository.create({
        ...post,
        title: dto.title,
        summary,
        content: dto.content,
        contentHtml: dto.contentHtml,
        tags: allTags, // 새로운 태그 관계로 완전 교체
      });

      await this.entityManager.save(updatedPost);

      // 썸네일이 변경된 경우
      if (dto.thumbnailBlobId) {
        const existsThumbnailAttachments = await this.attachmentRepository.find(
          {
            where: {
              name: 'thumbnail',
              recordType: 'post',
              recordId: updatedPost.id.toString(),
            },
          },
        );
        if (existsThumbnailAttachments.length !== 0) {
          await this.entityManager.remove(existsThumbnailAttachments);
        }

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
          recordId: updatedPost.id.toString(),
        });
        await this.entityManager.save(newThumbnailAttachment);
      }

      // 기존의 모든 컨텐츠 이미지 첨부 제거
      const contentImageAttachments = await this.attachmentRepository.find({
        where: {
          name: 'contentImage',
          recordType: 'post',
          recordId: updatedPost.id.toString(),
        },
      });
      await this.entityManager.remove(contentImageAttachments);

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
            recordId: updatedPost.id.toString(),
          });
        });
        await this.entityManager.save(newAttachments);
      }
    });
  }
}
