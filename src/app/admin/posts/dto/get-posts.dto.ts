import z from 'zod';

export const GetPostsSchema = z
  .object({
    search: z.string().optional().default(''),
    orderKey: z.string().optional().default('createdAt'),
    orderBy: z.string().optional().default('DESC'),
  })
  .transform((x) => {
    return { ...x, orderBy: x.orderBy as 'ASC' | 'DESC' };
  });

export type GetPostsDTO = z.infer<typeof GetPostsSchema>;
