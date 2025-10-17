import { parseSortString } from "src/shared/utils";
import z from "zod";

export const GetAdminCuratedItemsSchema = z.object({
  sort: z.string().optional().default('-createdAt'),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(10).max(50).default(10),
  sourceId: z.coerce.number().optional(),
}).transform((x) => {
  const { orderKey, orderBy } = parseSortString(x.sort, 'createdAt');
  return {
    ...x,
    orderBy,
    orderKey,
  };
});

export type GetAdminCuratedItemsDto = z.infer<typeof GetAdminCuratedItemsSchema>;