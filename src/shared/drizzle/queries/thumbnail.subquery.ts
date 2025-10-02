import { desc, eq } from "drizzle-orm";
import { DrizzleContext } from "../drizzle.context";
import { attachments, blobs } from "../schema";

export function getThumbnailSubquery() {
  const qb = DrizzleContext.db()
    .selectDistinctOn([
      attachments.recordType,
      attachments.recordId,
      attachments.name
    ], {
      recordType: attachments.recordType,
      recordId: attachments.recordId,
      name: attachments.name,
      metadata: blobs.metadata,
      key: blobs.key
    })
    .from(blobs)
    .leftJoin(attachments, eq(attachments.blobId, blobs.id))
    .where(eq(attachments.name, 'thumbnail'))
    .orderBy(attachments.recordType, attachments.recordId, attachments.name, desc(blobs.createdAt))
    .as('f');
  return {
    qb,
    columns: {
      file: {
        metadata: qb.metadata,
        key: qb.key
      }
    }
  } as const;
}