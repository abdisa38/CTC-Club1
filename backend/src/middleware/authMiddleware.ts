import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = expressAsyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const jwtSecret = String(process.env.JWT_SECRET || '').trim();
  const cookieName = String(process.env.JWT_COOKIE_NAME || 'jwt').trim() || 'jwt';

  if (!jwtSecret) {
    res.status(500);
    throw new Error('JWT_SECRET is not configured');
  }

  let token;
  token = req.cookies?.[cookieName];

  if (token) {
    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = user;
      next();
    } catch {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const optionalProtect = expressAsyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const jwtSecret = String(process.env.JWT_SECRET || '').trim();
  const cookieName = String(process.env.JWT_COOKIE_NAME || 'jwt').trim() || 'jwt';
  const token = req.cookies?.[cookieName];

  if (!token || !jwtSecret) {
    next();
    return;
  }

  try {
    const decoded: any = jwt.verify(token, jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    // Ignore invalid/expired tokens for optional auth routes.
  }

  next();
});

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role '${req.user.role}' is not authorized to access this route`);
    }
    next();
  };
};
