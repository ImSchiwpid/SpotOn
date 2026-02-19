import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV !== 'production';

const WINDOWS = {
  short: 15 * 60 * 1000,
  hourly: 60 * 60 * 1000
};

const LIMITS = {
  api: {
    windowMs: WINDOWS.short,
    devMax: 10000,
    prodMax: 100,
    message: 'Too many requests from this IP, please try again later.'
  },
  auth: {
    windowMs: WINDOWS.short,
    devMax: 1000,
    prodMax: 5,
    message: 'Too many login attempts, please try again after 15 minutes.',
    skipSuccessfulRequests: true
  },
  payment: {
    windowMs: WINDOWS.hourly,
    devMax: 500,
    prodMax: 10,
    message: 'Too many payment attempts, please try again later.'
  },
  upload: {
    windowMs: WINDOWS.hourly,
    devMax: 1000,
    prodMax: 20,
    message: 'Too many upload attempts, please try again later.'
  }
};

const createLimiter = ({ windowMs, devMax, prodMax, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    max: isDevelopment ? devMax : prodMax,
    message: {
      success: false,
      message
    },
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false
  });

export const apiLimiter = createLimiter(LIMITS.api);
export const authLimiter = createLimiter(LIMITS.auth);
export const paymentLimiter = createLimiter(LIMITS.payment);
export const uploadLimiter = createLimiter(LIMITS.upload);
