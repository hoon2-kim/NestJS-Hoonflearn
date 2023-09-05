import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

export const videoFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  const fileExtension = file.originalname.split('.')[1];
  const validExtension = ['mpg', 'mv4', 'mov', 'm2ts', 'mp4'];

  if (validExtension.includes(fileExtension)) {
    return callback(null, true);
  }

  return callback(
    new BadRequestException(
      '파일 확장자는 mpg, mv4, mov, m2ts, mp4만 가능합니다',
    ),
    false,
  );
};
