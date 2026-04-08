import { Response } from 'express';
import jwt from 'jsonwebtoken';

const generateToken = (res: Response, userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'fallback_secret', {
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
    expires: new Date(0),
  });
};

export default generateToken;
