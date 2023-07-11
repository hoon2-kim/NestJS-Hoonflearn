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

export enum FieldOfHopeType {
  DevProgram = '개발/프로그래밍',
  GameDev = '게임 개발',
  Security = '보안',
  DataScience = '데이터 사이언스',
  CreativeDesign = '크리에이티브/디자인',
  JobMarketing = '직무/마케팅',
  AcademicForeignLanguage = '학문/외국어',
  Career = '커리어',
  Etc = '기타',
}

@Entity({ name: 'instructors_profile' })
export class InstructorProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 연락받을 이메일
  @Column({ type: 'varchar', nullable: true })
  contactEmail: string;

  // 지식공유자 실명 또는 사업체명
  @Column({ type: 'varchar', nullable: true })
  nameOrBusiness: string;

  @Column({ type: 'enum', enum: FieldOfHopeType, nullable: true })
  fieldOfHope: FieldOfHopeType;

  // 나를 소개하는 글
  @Column({ type: 'text', nullable: true })
  aboutMe: string;

  // 나를 표현할수있는 링크
  @Column({ nullable: true })
  link?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
}
