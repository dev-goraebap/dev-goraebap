import z from 'zod';

import { YN } from 'src/domain/_concern';
import { parseSortString } from 'src/shared/utils';

export const GetAdminPostsSchema = z
  .object({
    sort: z.string().optional().default('-publishedAt'),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(10).max(50).default(10),
    search: z.string().optional().default(''),
    postType: z.string().optional().default(''),
    isPublishedYn: z.string().optional().default(undefined),
  })
  .transform((x) => {
    const { orderKey, orderBy } = parseSortString(x.sort, 'publishedAt');
    return {
      ...x,
      orderBy,
      orderKey,
      isPublishedYn: x.isPublishedYn as YN,
    };
  });

export type GetAdminPostsDto = z.infer<typeof GetAdminPostsSchema>;
