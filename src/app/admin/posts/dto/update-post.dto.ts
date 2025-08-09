import z from 'zod';

export const UpdatePostSchema = z
  .object({
    title: z.string().min(1, '제목을 입력해 주세요.'),
    content: z.string().min(1, '내용을 입력해 주세요.'),
    contentHtml: z.string().min(1, '내용을 입력해 주세요.'),
    thumbnailBlobId: z.string().optional(),
    tags: z.preprocess(
      (val) => (val === undefined ? [] : val),
      z.array(z.string()).min(1, '한개 이상의 태그를 포함해주세요.'),
    ),
  })
  .transform((x) => {
    return {
      ...x,
      thumbnailBlobId: x.thumbnailBlobId ? Number(x.thumbnailBlobId) : null,
    };
  });

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
