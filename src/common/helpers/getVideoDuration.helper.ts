import ffmpeg from 'fluent-ffmpeg';

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
