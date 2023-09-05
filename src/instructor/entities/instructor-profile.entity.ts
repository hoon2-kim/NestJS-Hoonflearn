import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
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

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
}
