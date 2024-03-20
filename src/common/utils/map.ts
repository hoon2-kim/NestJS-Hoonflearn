type ObjectType = Record<string, number | string | boolean>;

/** map을 객체로 변환해주는 함수 */
export const mapToObj = (map: Map<string, any>) => {
  const obj: ObjectType = {};

  for (const [k, v] of map) {
    obj[k] = v;
  }

  return obj;
};
