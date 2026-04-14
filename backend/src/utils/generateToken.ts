import { Response } from 'express';
import jwt from 'jsonwebtoken';

const generateToken = (res: Response, userId: string, role: string) => {
  const jwtSecret = String(process.env.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const cookieName = String(process.env.JWT_COOKIE_NAME || 'jwt').trim() || 'jwt';
  const expiresIn = String(process.env.JWT_EXPIRES_IN || '7d').trim() || '7d';
  const maxAge = Number(process.env.JWT_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000);

  const token = jwt.sign({ id: userId, role }, jwtSecret, {
    expiresIn,
  });

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.JWT_COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: Number.isFinite(maxAge) && maxAge > 0 ? maxAge : 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export const clearToken = (res: Response) => {
  const cookieName = String(process.env.JWT_COOKIE_NAME || 'jwt').trim() || 'jwt';

  res.cookie(cookieName, '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production' || process.env.JWT_COOKIE_SECURE === 'true',
  });
};

export default generateToken;
