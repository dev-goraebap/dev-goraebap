import { z } from 'zod';

export const CreateTagSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해주세요.'),
    description: z.string().min(1, '내용을 입력해주세요.'),
  })

export type CreateTagDto = z.infer<typeof CreateTagSchema>;
