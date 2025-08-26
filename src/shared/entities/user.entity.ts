import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { BaseEntityWithAttachments } from "./_/base-entity-with-attachments";
import { PostEntity } from "./post.entity";
import { SeriesEntity } from "./series.entity";
import { TagEntity } from "./tag.entity";

@Entity({ name: 'users' })
export class UserEntity extends BaseEntityWithAttachments {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true, length: 254 })
  readonly email: string;

  @Column({ length: 50 })
  readonly nickname: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => PostEntity, e => e.user)
  readonly posts: PostEntity[];

  @OneToMany(() => SeriesEntity, e => e.user)
  readonly seriesList: SeriesEntity[];

  @OneToMany(() => TagEntity, e => e.user)
  readonly tags: TagEntity[];
}