import { compareAsc, format } from 'date-fns';

/**
 * 날짜 비교 유틸 함수
 * @param endAt 쿠폰 만료 날짜
 * @returns
 */
export const compareCouponEndAt = (endAt: string) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const formatEndAt = format(endAt, 'yyyy-MM-dd');

  const result = compareAsc(today, formatEndAt);

  return result; // 1이 만료
};
