import { Response } from 'express';
interface SuccessOptions {
    statusCode?: number;
    message?: string;
    meta?: Record<string, unknown>;
}
export declare const sendSuccess: <T>(res: Response, data: T, options?: SuccessOptions) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=apiResponse.d.ts.map