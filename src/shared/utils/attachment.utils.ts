import { SelectQueryBuilder } from 'typeorm';

export class AttachmentQueryHelper {
  /**
   * QueryBuilder에 attachment와 blob을 조인하여 첨부파일 정보를 포함시킵니다.
   * 
   * @param queryBuilder - TypeORM QueryBuilder 인스턴스
   * @param entityAlias - 메인 엔티티의 별칭 (예: 'post', 'series')
   * @param recordType - attachment 테이블의 recordType 값 (선택사항, 기본값은 entityAlias와 동일)
   * @returns 수정된 QueryBuilder 인스턴스
   * 
   * @example
   * ```typescript
   * const qb = repository.createQueryBuilder('post');
   * AttachmentQueryHelper.withAttachments(qb, 'post');
   * // 또는 recordType을 명시적으로 지정
   * AttachmentQueryHelper.withAttachments(qb, 'post', 'blog_post');
   * ```
   */
  static withAttachments(
    queryBuilder: SelectQueryBuilder<any>,
    entityAlias: string,
    recordType?: string,
  ): SelectQueryBuilder<any> {
    const actualRecordType = recordType || entityAlias;
    
    const joinCondition = `attachment.recordType = :recordType AND attachment.recordId = CAST(${entityAlias}.id AS VARCHAR)`;
    const parameters: any = { recordType: actualRecordType };

    return queryBuilder
      .leftJoinAndMapMany(
        `${entityAlias}.attachments`,
        'attachments',
        'attachment',
        joinCondition,
        parameters,
      )
      .leftJoinAndSelect('attachment.blob', 'blob');
  }
}
