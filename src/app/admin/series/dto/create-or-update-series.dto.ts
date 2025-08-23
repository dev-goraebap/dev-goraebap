import { randomUUID } from 'crypto';
import { z } from 'zod';

export const CreateSeriesSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해주세요.'),
    description: z.string().optional(),
    thumbnailBlobId: z.string().min(1, '썸네일 이미지는 필수로 등록해야합니다.'),
    slug: z.string().optional(),
    status: z.string().optional(),
  })
  .transform((x) => {
    return {
      ...x,
      slug: x.slug || randomUUID(),
      status: x.status || 'PLAN',
      thumbnailBlobId: Number(x.thumbnailBlobId),
    };
  });

export type CreateSeriesDto = z.infer<typeof CreateSeriesSchema>;

export const UpdateSeriesSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해주세요.'),
    description: z.string().optional(),
    thumbnailBlobId: z.string().optional(),
    slug: z.string().optional(),
    status: z.string().optional(),
  })
  .transform((x) => {
    return {
      ...x,
      slug: x.slug || randomUUID(),
      status: x.status || 'PLAN',
      thumbnailBlobId: x.thumbnailBlobId ? Number(x.thumbnailBlobId) : null,
    };
  });

export type UpdateSeriesDto = z.infer<typeof UpdateSeriesSchema>;
