import { and, eq, lt } from "drizzle-orm";

import { blockedIps, DrizzleContext, InsertBlockedIp, SelectBlockedIp } from "src/shared/drizzle";

export class BlockedIpEntity implements SelectBlockedIp {
  private constructor(
    readonly id: number,
    readonly ipAddress: string,
    readonly reason: string | null,
    readonly blockedBy: string,
    readonly expiresAt: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly isActiveYn: string,
  ) { }

  static fromRaw(data: SelectBlockedIp): BlockedIpEntity {
    return new BlockedIpEntity(
      data.id,
      data.ipAddress,
      data.reason,
      data.blockedBy,
      data.expiresAt,
      data.createdAt,
      data.updatedAt,
      data.isActiveYn,
    );
  }

  /**
   * 활성화되고 만료되지 않은 IP 확인 (WAF용)
   */
  static async findActiveByIp(ip: string): Promise<BlockedIpEntity | null> {
    const result = await DrizzleContext.db().query.blockedIps.findFirst({
      where: and(
        eq(blockedIps.ipAddress, ip),
        eq(blockedIps.isActiveYn, 'Y')
      )
    });

    if (!result) return null;

    const entity = BlockedIpEntity.fromRaw(result);

    // 만료되었으면 자동으로 비활성화하고 null 반환
    if (entity.isExpired()) {
      await this.deactivate(entity.id);
      return null;
    }

    return entity;
  }

  static async findById(id: number): Promise<BlockedIpEntity | null> {
    const result = await DrizzleContext.db().query.blockedIps.findFirst({
      where: eq(blockedIps.id, id)
    });
    return result ? BlockedIpEntity.fromRaw(result) : null;
  }

  static async findAll(): Promise<BlockedIpEntity[]> {
    const results = await DrizzleContext.db().query.blockedIps.findMany({
      orderBy: (blockedIps, { desc }) => [desc(blockedIps.createdAt)]
    });
    return results.map(raw => BlockedIpEntity.fromRaw(raw));
  }

  static async create(data: InsertBlockedIp): Promise<BlockedIpEntity> {
    const [raw] = await DrizzleContext.db()
      .insert(blockedIps)
      .values(data)
      .returning();
    return BlockedIpEntity.fromRaw(raw);
  }

  /**
   * 자동 차단 (이미 존재하면 스킵)
   */
  static async autoBlock(ip: string, reason: string, expiresInHours: number = 24): Promise<BlockedIpEntity | null> {
    // 이미 차단되어 있는지 확인
    const existing = await DrizzleContext.db().query.blockedIps.findFirst({
      where: eq(blockedIps.ipAddress, ip)
    });

    if (existing) {
      return null; // 이미 존재하면 스킵
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    return await this.create({
      ipAddress: ip,
      reason,
      blockedBy: 'auto',
      expiresAt: expiresAt.toISOString(),
      isActiveYn: 'Y',
    });
  }

  /**
   * 차단 해제
   */
  static async deactivate(id: number): Promise<void> {
    await DrizzleContext.db()
      .update(blockedIps)
      .set({ isActiveYn: 'N' })
      .where(eq(blockedIps.id, id));
  }

  /**
   * 만료된 IP들 일괄 비활성화 (배치용)
   */
  static async expireOldBlocks(): Promise<number> {
    const now = new Date();
    const result = await DrizzleContext.db()
      .update(blockedIps)
      .set({ isActiveYn: 'N' })
      .where(
        and(
          eq(blockedIps.isActiveYn, 'Y'),
          lt(blockedIps.expiresAt, now.toISOString())
        )
      )
      .returning();

    return result.length;
  }

  /**
   * 만료 여부 체크
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > new Date(this.expiresAt);
  }

  /**
   * 활성화 여부
   */
  isActive(): boolean {
    return this.isActiveYn === 'Y' && !this.isExpired();
  }
}