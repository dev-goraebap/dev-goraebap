import z from 'zod';

export const UpdatePublishSchema = z.object({
  isPublishedYn: z.string().optional().default('N'),
});

export type UpdatePublishDto = z.infer<typeof UpdatePublishSchema>;
