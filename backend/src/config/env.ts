const required = (name: string): string => {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const optional = (name: string, fallback = ''): string => {
  const value = String(process.env[name] || '').trim();
  return value || fallback;
};

const optionalNumber = (name: string, fallback: number): number => {
  const raw = String(process.env[name] || '').trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
};

const optionalBoolean = (name: string, fallback: boolean): boolean => {
  const raw = String(process.env[name] || '').trim().toLowerCase();
  if (!raw) {
    return fallback;
  }

  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
};

const parseOrigins = () => {
  const csv = optional('CORS_ALLOWED_ORIGINS');
  if (!csv) {
    return [] as string[];
  }

  return csv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: optionalNumber('PORT', 5000),
  mongoUri: required('MONGO_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),
  authCookieName: optional('JWT_COOKIE_NAME', 'jwt'),
  authCookieMaxAgeMs: optionalNumber('JWT_COOKIE_MAX_AGE_MS', 7 * 24 * 60 * 60 * 1000),
  authCookieSameSite: optional('JWT_COOKIE_SAMESITE', 'strict').toLowerCase(),
  authCookieSecure: optionalBoolean('JWT_COOKIE_SECURE', optional('NODE_ENV', 'development') === 'production'),
  trustProxy: optionalBoolean('TRUST_PROXY', false),
  corsAllowedOrigins: parseOrigins(),
  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),
  requestBodyLimit: optional('REQUEST_BODY_LIMIT', '1mb'),
};

export const isProduction = env.nodeEnv === 'production';

export const cookieSameSite =
  env.authCookieSameSite === 'lax' || env.authCookieSameSite === 'none' || env.authCookieSameSite === 'strict'
    ? (env.authCookieSameSite as 'lax' | 'none' | 'strict')
    : 'strict';
