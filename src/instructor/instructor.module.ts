import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorProfileEntity } from './entities/instructor-profile.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstructorProfileEntity, UserEntity]),
    AuthModule,
    UserModule,
  ],
  controllers: [InstructorController],
  providers: [InstructorService],
})
export class InstructorModule {}
