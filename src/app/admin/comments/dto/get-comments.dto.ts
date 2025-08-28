import z from 'zod';

export const GetCommentsSchema = z
  .object({
    search: z.string().optional().default(''),
    orderKey: z.string().optional().default('createdAt'),
    orderBy: z.string().optional().default('DESC'),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(10).max(50).default(10),
  })
  .transform((x) => {
    return {
      ...x,
      orderBy: x.orderBy as 'ASC' | 'DESC',
    };
  });

export type GetCommentsDto = z.infer<typeof GetCommentsSchema>;
