import z from 'zod';

export const GetPostsSchema = z.object({
  orderType: z.string().default('traffic'), // traffic, latest
  cursor: z.string().optional(),
  perPage: z.number().min(5).max(10).default(5),
});

export type GetPostsDto = z.infer<typeof GetPostsSchema>;
