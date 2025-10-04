import z from 'zod';

export const UpdatePublishSchema = z.object({
  isPublishedYn: z.enum(['Y', 'N']).optional().default('N'),
});

export type UpdatePublishDto = z.infer<typeof UpdatePublishSchema>;
