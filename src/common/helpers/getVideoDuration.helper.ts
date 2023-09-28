import ffmpeg from 'fluent-ffmpeg';
/**
 * 동영상 길이 구하는 헬퍼함수
 * @param s3url s3업로드 주소
 */
export const getVideoDuration = (s3url: string): Promise<number> => {
  return new Promise((resovle, reject) => {
    ffmpeg.ffprobe(s3url, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      resovle(metadata.format.duration);
    });
  });
};
