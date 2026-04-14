import { type NextFunction, type Request, type Response } from 'express';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const sanitizeKey = (key: string) => {
  // Prevent Mongo operator and path injection via keys like $where and a.b
  if (key.startsWith('$')) {
    return '';
  }

  if (key.includes('.')) {
    return key.replace(/\./g, '_');
  }

  return key;
};

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const safeKey = sanitizeKey(key);
      if (!safeKey) {
        continue;
      }
      output[safeKey] = sanitizeValue(nestedValue);
    }
    return output;
  }

  if (typeof value === 'string') {
    // Normalize control characters to reduce header/body smuggling and log pollution vectors.
    return value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  }

  return value;
};

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitizeValue(req.body) as Request['body'];
  req.query = sanitizeValue(req.query) as Request['query'];
  req.params = sanitizeValue(req.params) as Request['params'];
  next();
};
