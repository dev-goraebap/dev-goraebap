import { TagData, TagEntity } from 'src/app/tag/domain';
import { InsertTag, SelectTag } from 'src/shared/drizzle/schema';

export class TagDataMapper {
  static toInsertData(entity: TagEntity): InsertTag {
    return {
      userId: entity.userId,
      name: entity.name,
      description: entity.description || ''
    };
  }

  static toUpdateData(entity: TagEntity): Partial<InsertTag> {
    return {
      name: entity.name,
      description: entity.description || '',
      updatedAt: new Date().toISOString()
    };
  }

  static toEntity(dbData: SelectTag): TagEntity {
    const tagData: TagData = {
      id: dbData.id,
      userId: dbData.userId!,
      name: dbData.name,
      description: dbData.description || undefined,
      createdAt: new Date(dbData.createdAt),
      updatedAt: new Date(dbData.updatedAt)
    };

    return TagEntity.from(tagData);
  }
}