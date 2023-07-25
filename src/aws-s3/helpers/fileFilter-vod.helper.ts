type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  if (!file) {
    return callback(new Error('파일이 없습니다.'), false);
  }

  const fileExtension = file.mimetype.split('/')[1];
  const validExtension = ['mpg', 'mv4', 'mov', 'm2ts', 'mp4'];

  if (validExtension.includes(fileExtension)) {
    return callback(null, true);
  }

  return callback(
    new Error('파일 확장자는 mpg, mv4, mov, m2ts, mp4만 가능합니다'),
    false,
  );
};
