import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel';
import { getJwtSecret } from '../config/env';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = expressAsyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const optionalProtect = expressAsyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    next();
    return;
  }

  try {
    const decoded: any = jwt.verify(token, getJwtSecret());
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
