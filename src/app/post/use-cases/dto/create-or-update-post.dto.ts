import { randomUUID } from 'crypto';
import z from 'zod';

const BasePostSchema = z.object({
  content: z.string().min(1, '내용을 입력해 주세요.'),
  slug: z.string().optional(),
  thumbnailBlobId: z.string().optional(),
  isPublishedYn: z.enum(['N', 'Y']).optional().default('N'),
  publishedAt: z.string().optional(),
  postType: z.string().default('post'),
  tags: z.preprocess((val) => (val === undefined ? [] : val), z.array(z.string()).optional().default([])),
});

const PostTransform = <T extends z.infer<typeof BasePostSchema>>(x: T) => {
  const publishedAt = x.publishedAt ? new Date(x.publishedAt) : new Date();

  return {
    content: x.content,
    slug: x.slug || randomUUID(),
    thumbnailBlobId: x.thumbnailBlobId ? Number(x.thumbnailBlobId) : null,
    postType: x.postType,
    tags: x.tags,
    publishedAt,
    isPublishedYn: x.isPublishedYn,
  } as const;
};

export const CreatePostSchema = BasePostSchema.extend({
  postType: z.string().default('post'), // 기본값 있음
}).transform(PostTransform);

export type CreatePostDto = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = BasePostSchema.extend({
  postType: z.string(), // 필수값
}).transform(PostTransform);

export type UpdatePostDto = z.infer<typeof CreatePostSchema>;
