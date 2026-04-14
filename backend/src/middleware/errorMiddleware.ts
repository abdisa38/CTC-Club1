import { type Request, type Response, type NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

type ErrorWithStatus = Error & {
    statusCode?: number;
    code?: number | string;
    errors?: unknown;
};

const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const normalizeStatusCode = (err: ErrorWithStatus, currentStatus: number) => {
    if (typeof err.statusCode === 'number' && err.statusCode >= 400) {
        return err.statusCode;
    }

    if (typeof err.code === 'number' && err.code === 11000) {
        return 409;
    }

    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return 400;
    }

    if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
        return 401;
    }

    return currentStatus === 200 ? 500 : currentStatus;
};

const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
    const statusCode = normalizeStatusCode(err, res.statusCode);
    res.status(statusCode);

    const details =
        err.name === 'ValidationError' && err.errors
            ? Object.values(err.errors as Record<string, { message?: string }>).map((item) => item?.message).filter(Boolean)
            : undefined;

    res.json({
        success: false,
        message: err.message || 'Server error',
        code: statusCode,
        details,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

export { notFound, errorHandler };
