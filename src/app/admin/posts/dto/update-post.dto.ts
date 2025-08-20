import { randomUUID } from 'crypto';
import z from 'zod';
import { validateAndExtractContent } from '../utils/extract-html-content';

export const UpdatePostSchema = z
  .object({
    content: z.string().min(1, '내용을 입력해 주세요.'),
    slug: z.string().optional(),
    thumbnailBlobId: z.string().optional(),
    publishedAt: z.string().optional(),
    postType: z.string(),
    tags: z.preprocess(
      (val) => (val === undefined ? [] : val),
      z.array(z.string()).optional().default([]),
    ),
  })
  .transform((x) => {
    const contentValidation = validateAndExtractContent(x.content);
    
    if (!contentValidation.isValid) {
      throw new Error(contentValidation.errors.join(', '));
    }

    const publishedAt = x.publishedAt ? new Date(x.publishedAt) : new Date();
    const isPublished = !!x.publishedAt;

    return {
      ...x,
      content: x.content,
      title: contentValidation.title,
      summary: contentValidation.summary,
      slug: x.slug || randomUUID(),
      thumbnailBlobId: x.thumbnailBlobId ? Number(x.thumbnailBlobId) : null,
      publishedAt,
      isPublished,
      tags: x.tags,
    };
  });

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
