import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { AttachmentEntity, BlobEntity, PostEntity, TagEntity } from 'src/shared';
import { UpdatePostDto } from '../dto/update-post.dto';
import { extractImageUrls } from '../utils/extract-html-content';

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
        summary: dto.summary,
        content: dto.content,
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

      // TinyMCE HTML에서 이미지 URL 추출
      const imageUrls = extractImageUrls(dto.content);

      // 이미지 URL이 있는 경우 blob key로 변환하여 첨부 생성
      if (imageUrls.length > 0) {
        // 이미지 URL에서 blob key 추출 (32자리 hex key)
        const blobKeys = imageUrls
          .map(url => {
            // URL에서 blob key를 추출하는 로직 (마지막 32자리 hex 문자열)
            const match = url.match(/([a-f0-9]{32})$/);
            return match ? match[1] : null;
          })
          .filter(key => key !== null);

        if (blobKeys.length > 0) {
          const blobs = await this.blobRepository.find({
            where: {
              key: In(blobKeys),
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
      }
    });
  }
}
