import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ name: 'categories' })
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'fk_parent_category_id' })
  parent: CategoryEntity;

  @Exclude()
  @Column({ type: 'uuid', nullable: true })
  fk_parent_category_id: string;

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children: CategoryEntity[];

  //   @OneToMany(() => CategoryCourse, (categoryCourse) => categoryCourse.category)
  //   categoriesCourses: CategoryCourse[];
}
