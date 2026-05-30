import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import type { Request, Response, NextFunction } from 'express';

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

export const noSqlSanitizer = mongoSanitize();

export const paramPollutionProtection = hpp();

export function requestValidator(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers['content-type'];
  if (req.method === 'POST' && contentType && !contentType.includes('application/json')) {
    if (req.path.startsWith('/api')) {
      return res.status(415).json({ error: 'Unsupported media type. Use application/json.' });
    }
  }
  next();
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}
