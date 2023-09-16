import { Exclude } from 'class-transformer';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EFieldOfHopeType } from '../enums/instructor.enum';

@Entity({ name: 'instructorsProfile' })
export class InstructorProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, comment: '연락받을 이메일' })
  contactEmail: string;

  @Column({ type: 'varchar', comment: '지식공유자 실명 또는 사업체명' })
  nameOrBusiness: string;

  @Column({ type: 'enum', enum: EFieldOfHopeType, comment: '희망하는 분야' })
  fieldOfHope: EFieldOfHopeType;

  @Column({ type: 'text', comment: '나를 소개하는 글' })
  aboutMe: string;

  @Column({ nullable: true, comment: '나를 표현할 수 있는 링크' })
  link?: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;
}
