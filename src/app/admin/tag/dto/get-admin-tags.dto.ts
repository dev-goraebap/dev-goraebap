import z from 'zod';

import { parseSortString } from 'src/shared/utils';

export const GetAdminTagsSchema = z
  .object({
    sort: z.string().optional().default('-createdAt'),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(10).max(50).default(10),
    search: z.string().optional().default(''),
  })
  .transform((x) => {
    const { orderKey, orderBy } = parseSortString(x.sort, 'createdAt');
    return {
      ...x,
      orderBy,
      orderKey,
    };
  });

export type GetAdminTagsDto = z.infer<typeof GetAdminTagsSchema>;
