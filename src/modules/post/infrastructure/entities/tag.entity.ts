import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from 'src/modules/user';
import { PostEntity } from './post.entity';

@Entity({ name: 'tags' })
export class TagEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true, length: 100 })
  readonly name: string;

  @Column({ length: 500 })
  readonly description: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => UserEntity, (e) => e.tags, { onDelete: 'CASCADE' })
  readonly user: UserEntity;

  @ManyToMany(() => PostEntity, (post) => post.tags)
  readonly posts: PostEntity[];
}
