import { randomUUID } from 'crypto';
import { z } from 'zod';

const BaseSeriesSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  description: z.string().optional(),
  slug: z.string().optional(),
  status: z.string().optional(),
  isPublishedYn: z.string().optional().default('N'),
  publishedAt: z.string().optional(),
});

const SeriesTransform = (x: z.infer<typeof BaseSeriesSchema>) => {
  const publishedAt = x.publishedAt ? new Date(x.publishedAt) : new Date();

  return {
    ...x,
    slug: x.slug || randomUUID(),
    status: x.status || 'PLAN',
    publishedAt,
    isPublishedYn: x.isPublishedYn,
  };
};

export const CreateSeriesSchema = BaseSeriesSchema.extend({
  thumbnailBlobId: z.string().min(1, '썸네일 이미지는 필수로 등록해야합니다.'),
}).transform((x) => ({
  ...SeriesTransform(x),
  thumbnailBlobId: Number(x.thumbnailBlobId),
}));

export const UpdateSeriesSchema = BaseSeriesSchema.extend({
  thumbnailBlobId: z.string().optional(),
}).transform((x) => ({
  ...SeriesTransform(x),
  thumbnailBlobId: x.thumbnailBlobId ? Number(x.thumbnailBlobId) : null,
}));

export type CreateSeriesDto = z.infer<typeof CreateSeriesSchema>;
export type UpdateSeriesDto = z.infer<typeof UpdateSeriesSchema>;
