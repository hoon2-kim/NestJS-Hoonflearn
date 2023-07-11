import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AwsS3Module } from '../aws-s3/aws-s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AwsS3Module],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
