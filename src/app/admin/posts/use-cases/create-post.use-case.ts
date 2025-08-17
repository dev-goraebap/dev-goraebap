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
import { extractImageUrls } from '../utils/extract-html-content';

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
        summary: dto.summary,
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

      // TinyMCE HTML에서 이미지 URL 추출
      const imageUrls = extractImageUrls(dto.content);

      console.log('=======================');
      console.log(imageUrls);
      console.log('=======================');

      // 이미지 URL이 있는 경우 blob key로 변환하여 첨부 생성
      if (imageUrls.length > 0) {
        // 이미지 URL에서 blob key 추출 (32자리 hex key)
        const blobKeys = imageUrls
          .map((url) => {
            // URL에서 blob key를 추출하는 로직 (마지막 32자리 hex 문자열)
            const match = url.match(/([a-f0-9]{32})$/);
            return match ? match[1] : null;
          })
          .filter((key) => key !== null);

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
              recordId: newPost.id.toString(),
            });
          });
          await this.entityManager.save(newAttachments);
        }
      }
    });
  }
}
