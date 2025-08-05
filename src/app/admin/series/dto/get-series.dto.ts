import z from 'zod';

export const GetSeriesSchema = z
  .object({
    search: z.string().optional().default(''),
    orderKey: z.string().optional().default('createdAt'),
    orderBy: z.string().optional().default('DESC'),
  })
  .transform((x) => {
    return { ...x, orderBy: x.orderBy as 'ASC' | 'DESC' };
  });

export type GetSeriesDto = z.infer<typeof GetSeriesSchema>;
