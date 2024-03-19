export const createRandomToken = (digit = 6) => {
  const phoneToken = String(Math.floor(Math.random() * 1000000)).padStart(
    digit,
    '0',
  );
  return phoneToken;
};
