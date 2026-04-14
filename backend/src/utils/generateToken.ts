import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/env';

const generateToken = (res: Response, userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, getJwtSecret(), {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export const clearToken = (res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });
};

export default generateToken;
