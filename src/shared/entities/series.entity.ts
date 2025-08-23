import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BaseEntityWithAttachments } from './_/base-entity-with-attachments';
import { SeriesPostEntity } from './series-post.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'series' })
export class SeriesEntity extends BaseEntityWithAttachments {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly name: string;

  @Column({ unique: true })
  readonly slug: string;

  @Column({ nullable: true })
  readonly description: string;


  @Column({ default: 'PLAN' })
  readonly status: string; // PLAN, PROGRESS, COMPLETE

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => UserEntity, (e) => e.seriesList, { onDelete: 'CASCADE' })
  readonly user: UserEntity;

  @OneToMany(() => SeriesPostEntity, (e) => e.series)
  readonly seriesPosts: SeriesPostEntity[];
}
