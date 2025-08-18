import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BaseEntityWithAttachments } from './_/base-entity-with-attachments';
import { SeriesPostEntity } from './series-post.entity';
import { TagEntity } from './tag.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntityWithAttachments {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly title: string;

  @Column()
  readonly summary: string;

  @Column()
  readonly content: string;

  @Column()
  readonly isPublished: boolean;

  @Column()
  readonly publishedAt: Date;

  @Column({ default: 0 })
  readonly viewCount: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => UserEntity, (e) => e.posts, { onDelete: 'CASCADE' })
  readonly user: UserEntity;

  @OneToMany(() => SeriesPostEntity, (e) => e.post)
  readonly seriesPosts: SeriesPostEntity[];

  @ManyToMany(() => TagEntity, (e) => e.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  readonly tags: TagEntity[];
}
