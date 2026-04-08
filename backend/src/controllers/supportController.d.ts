import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const submitTicket: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTickets: (req: AuthRequest, res: Response) => Promise<void>;
export declare const replyTicket: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=supportController.d.ts.map