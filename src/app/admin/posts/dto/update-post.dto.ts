import z from 'zod';
import { validateAndExtractContent } from '../utils/extract-html-content';

export const UpdatePostSchema = z
  .object({
    content: z.string().min(1, '내용을 입력해 주세요.'),
    thumbnailBlobId: z.string().optional(),
    tags: z.preprocess(
      (val) => (val === undefined ? [] : val),
      z.array(z.string()).min(1, '한개 이상의 태그를 포함해주세요.'),
    ),
  })
  .transform((x) => {
    const contentValidation = validateAndExtractContent(x.content);
    
    if (!contentValidation.isValid) {
      throw new Error(contentValidation.errors.join(', '));
    }

    return {
      content: x.content,
      title: contentValidation.title,
      summary: contentValidation.summary,
      thumbnailBlobId: x.thumbnailBlobId ? Number(x.thumbnailBlobId) : null,
      tags: x.tags,
    };
  });

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
