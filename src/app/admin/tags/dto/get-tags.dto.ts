import z from 'zod';

export const GetTagsSchema = z.object({
  search: z.string().optional().default(''),
  orderKey: z.string().optional().default('createdAt'),
  orderBy: z.string().optional().default('desc'),
})

export type GetTagsDto = z.infer<typeof GetTagsSchema>;
