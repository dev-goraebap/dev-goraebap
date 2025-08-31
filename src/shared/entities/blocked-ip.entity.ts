import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'blocked_ips' })
@Index(['ipAddress'], { unique: true })
@Index(['isActiveYn', 'expiresAt'])
export class BlockedIpEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ type: 'inet' })
  readonly ipAddress: string;

  @Column({ type: 'text', nullable: true })
  readonly reason: string | null;

  @Column({ length: 20, default: 'manual' })
  readonly blockedBy: string; // manual, auto

  @Column({ type: 'timestamptz', nullable: true })
  readonly expiresAt: Date | null;

  @Column({ default: 'Y', length: 1 })
  readonly isActiveYn: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
