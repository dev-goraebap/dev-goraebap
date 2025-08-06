import { z } from 'zod';

export const CreatePostSchema = z
  .object({
    title: z.string().min(1, '제목을 입력해 주세요.'),
    content: z.string().min(1, '내용을 입력해 주세요.'),
    thumbnailBlobId: z
      .string()
      .min(1, '썸네일 이미지는 필수로 등록해야합니다.'),
    contentBlobIds: z.array(z.string()).optional()
  })
  .transform((x) => {
    return {
      ...x,
      thumbnailBlobId: Number(x.thumbnailBlobId),
      contentBlobIds: x.contentBlobIds?.length ? x.contentBlobIds.map(x => Number(x)) : []
    };
  });

export type CreatePostDto = z.infer<typeof CreatePostSchema>;


