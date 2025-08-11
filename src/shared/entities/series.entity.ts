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
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'series' })
export class SeriesEntity extends BaseEntityWithAttachments {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly name: string;

  @Column()
  readonly description: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => UserEntity, (e) => e.seriesList, { onDelete: 'CASCADE' })
  readonly user: UserEntity;

  @OneToMany(() => PostEntity, (e) => e.series)
  readonly posts: PostEntity[];
}
