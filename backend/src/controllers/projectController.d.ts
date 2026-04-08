import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const createProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const submitProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reviewProject: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=projectController.d.ts.map