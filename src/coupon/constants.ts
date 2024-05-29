export const BULL_REGISTER_QUEUE_NAME = 'CouponQueue';
export const BULL_QUEUE_ADD_NAME = 'register-coupon';

export const REDIS_COUPON_HASH_KEY = (key: string) => `hash:coupon:${key}`;
export const REDIS_COUPON_SET_KEY = (key: string) => `set:coupon:${key}`;
