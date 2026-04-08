import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
export declare const validateRequest: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=validateMiddleware.d.ts.map