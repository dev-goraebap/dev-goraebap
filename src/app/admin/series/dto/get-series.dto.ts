import { parseSortString } from 'src/shared';
import z from 'zod';

export const GetSeriesSchema = z
  .object({
    sort: z.string().optional().default('-publishedAt'),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(10).max(50).default(10),
    search: z.string().optional().default(''),
    status: z.string().optional().default(''),
    isPublishedYn: z.string().optional().default(''),
  })
  .transform((x) => {
    const { orderKey, orderBy } = parseSortString(x.sort, 'publishedAt');
    return {
      ...x,
      orderBy,
      orderKey,
    };
  });

export type GetSeriesDto = z.infer<typeof GetSeriesSchema>;
