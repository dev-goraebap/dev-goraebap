import { z } from 'zod';

export const CreateSeriesPostSchema = z
  .object({
    postId: z.string().min(1, '게시물 ID는 필수값 입니다.'),
  })
  .transform((x) => {
    return {
      ...x,
      postId: Number(x.postId),
    };
  });

export type CreateSeriesPostDto = z.infer<typeof CreateSeriesPostSchema>;
