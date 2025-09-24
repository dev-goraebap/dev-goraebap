import { Injectable } from '@nestjs/common';


@Injectable()
export class PostPatchNotesService {
  constructor(
  ) {}

  async getPatchNotes() {
    // const qb = this.postRepository.createQueryBuilder('post');
    // qb.leftJoinAndSelect('post.comments', 'comment');
    // AttachmentQueryHelper.withAttachments(qb, 'post');
    // qb.where("post.isPublishedYn = 'Y'");
    // qb.andWhere('post.postType = :postType', { postType: 'patch-note' });
    // qb.orderBy('post.publishedAt', 'DESC');
    // return await qb.getMany();
  }

  async getOtherPatchNotes(excludeSlug: string) {
    // const qb = this.postRepository.createQueryBuilder('post');
    // AttachmentQueryHelper.withAttachments(qb, 'post');
    // qb.where("post.isPublishedYn = 'Y'");
    // qb.andWhere('post.postType = :postType', { postType: 'patch-note' });
    // qb.andWhere('post.slug != :slug', {
    //   slug: excludeSlug,
    // });
    // qb.orderBy('post.publishedAt', 'DESC');
    // return await qb.getMany();
  }

  async getPatchNote(slug: string) {
    // const qb = this.postRepository.createQueryBuilder('post');
    // AttachmentQueryHelper.withAttachments(qb, 'post');

    // qb.where("post.isPublishedYn = 'Y'");
    // qb.andWhere('post.slug = :slug', { slug: slug });

    // const result = await qb.getOne();
    // if (!result) {
    //   throw new NotFoundException('체인지로그를 찾을 수 없습니다.');
    // }
    // return result;
  }
}