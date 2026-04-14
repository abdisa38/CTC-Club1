import { type CookieOptions, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { cookieSameSite, env } from '../config/env';

const buildCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.authCookieSecure,
  sameSite: cookieSameSite,
  maxAge: env.authCookieMaxAgeMs,
  path: '/',
});

const generateToken = (res: Response, userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  res.cookie(env.authCookieName, token, buildCookieOptions());

  return token;
};

export const clearToken = (res: Response) => {
  res.cookie(env.authCookieName, '', {
    ...buildCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
};

export default generateToken;
