import rateLimit from "express-rate-limit";

type RateLimitOptions = {
  max: number;
  windowMs?: number;
  message: string;
  skipSuccessfulRequests?: boolean;
};

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const createRateLimiter = ({
  max,
  windowMs = WINDOW_MS,
  message,
  skipSuccessfulRequests = false,
}: RateLimitOptions) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (_req, res) => {
      res.status(429).json({ error: message });
    },
  });

export const globalLimiter = createRateLimiter({
  max: 100,
  message: "Too many requests, please try again later",
});

export const authRegisterLimiter = createRateLimiter({
  max: 5,
  message: "Too many registration attempts, please try again later",
});

export const authLoginLimiter = createRateLimiter({
  max: 10,
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: true, // only failed logins count toward the limit
});
