import 'dotenv/config';
import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';

const readEnv = (key: string) => String(process.env[key] || '').trim();

const requireEnv = (key: string) => {
  const value = readEnv(key);
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }

  return value;
};

const devJwtSecret = `dev-only-jwt-secret-${crypto.randomUUID()}`;
let warnedAboutDevJwtFallback = false;

export const getJwtSecret = () => {
  const configuredSecret = readEnv('JWT_SECRET');
  if (configuredSecret) {
    return configuredSecret;
  }

  if (isProduction) {
    throw new Error('[env] Missing required environment variable: JWT_SECRET');
  }

  if (!warnedAboutDevJwtFallback) {
    warnedAboutDevJwtFallback = true;
    console.warn('[security] JWT_SECRET is not set. Using a temporary development secret for this process only.');
  }

  return devJwtSecret;
};

export const getMongoUri = () => requireEnv('MONGO_URI');
