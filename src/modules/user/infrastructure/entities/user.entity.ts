import { PostEntity, TagEntity } from "src/modules/post";
import { SeriesEntity } from "src/modules/series";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
export class UserEntity {
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