import z from 'zod';

export const UpdatePostSchema = z
  .object({
    title: z.string().min(1, '제목을 입력해 주세요.'),
    content: z.string().min(1, '내용을 입력해 주세요.'),
    thumbnailBlobId: z.string().optional(),
    contentBlobIds: z.array(z.string()).optional(),
    removeContentBlobIds: z.array(z.string()).optional(),
  })
  .transform((x) => {
    return {
      ...x,
      thumbnailBlobId: x.thumbnailBlobId ? Number(x.thumbnailBlobId) : null,
      contentBlobIds: x.contentBlobIds?.length
        ? x.contentBlobIds.map((x) => Number(x))
        : [],
      removeContentBlobIds: x.removeContentBlobIds?.length
        ? x.removeContentBlobIds.map((x) => Number(x))
        : [],
    };
  });

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
