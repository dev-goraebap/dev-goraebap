import { z } from 'zod';

export const CreateOrUpdateTagSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  description: z.string().optional(),
});

export type CreateOrUpdateTagDto = z.infer<typeof CreateOrUpdateTagSchema>;
