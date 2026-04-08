import { Response } from 'express';
declare const generateToken: (res: Response, userId: string, role: string) => string;
export declare const clearToken: (res: Response) => void;
export default generateToken;
//# sourceMappingURL=generateToken.d.ts.map