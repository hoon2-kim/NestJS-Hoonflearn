import { BadRequestException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as path from 'path';

@Injectable()
export class AwsS3Service {
  private readonly aswS3: AWS.S3;
  private readonly S3_BUCKET_NAME: string;

  constructor() {
    this.aswS3 = new AWS.S3({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY as string,
      },
      region: process.env.AWS_S3_REGION as string,
    });
    this.S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
  }

  async uploadFileToS3(
    folder: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const splitFolder = folder.split('/');

      const key = `${splitFolder[0]}/${
        splitFolder[1]
      }/${Date.now()}_${path.basename(file.originalname)}`.replace(/ /g, '');

      await this.aswS3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer, // 이미지 or 동영상 데이터
          ACL: 'public-read',
          ContentType: file.mimetype,
        })
        .promise();

      return `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    } catch (error) {
      throw new BadRequestException(`File upload failed : ${error}`);
    }
  }

  async deleteS3Object(
    key: string,
    callback?: (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => void,
  ): Promise<{ success: true }> {
    try {
      await this.aswS3
        .deleteObject(
          {
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
          },
          callback,
        )
        .promise();

      return { success: true };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file : ${error}`);
    }
  }
}
