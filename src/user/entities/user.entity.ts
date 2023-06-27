import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum RoleType {
  User = 'User',
  Instructor = 'Instructor',
}

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  nickname: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  profileAvatar: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.User })
  role: RoleType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Exclude()
  @Column({ type: 'varchar', default: null })
  hashedRt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  // @OneToOne(
  //   () => InstructorProfile,
  //   (instructorProfile) => instructorProfile.user,
  // )
  // instructorProfile: InstructorProfile;
}
