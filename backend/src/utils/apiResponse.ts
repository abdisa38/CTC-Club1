import { Response } from 'express';

interface SuccessOptions {
  statusCode?: number;
  message?: string;
  meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(res: Response, data: T, options: SuccessOptions = {}) => {
  const { statusCode = 200, message, meta } = options;

  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
    ...(meta ? { meta } : {}),
  });
};
