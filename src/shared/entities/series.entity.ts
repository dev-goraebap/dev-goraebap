import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity({ name: 'series' })
export class SeriesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  readonly name: string;
  
  @Column()
  readonly description: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => PostEntity, e => e.series)
  readonly posts: PostEntity[];
}
