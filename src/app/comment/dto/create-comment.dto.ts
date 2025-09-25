import z from 'zod';

export const CreateCommentSchema = z.object({
  avatarNo: z.coerce.number(),
  nickname: z.string(),
  comment: z.string(),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
