import z from 'zod';

export const GetPostsSchema = z
  .object({
    search: z.string().optional().default(''),
    postType: z.string().optional().default('post'),
    isPublished: z.string().optional().default(''),
    orderKey: z.string().optional().default('publishedAt'),
    orderBy: z.string().optional().default('DESC'),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(5).max(50).default(5),
  })
  .transform((x) => {
    return {
      ...x,
      orderBy: x.orderBy as 'ASC' | 'DESC',
    };
  });

export type GetPostsDTO = z.infer<typeof GetPostsSchema>;
