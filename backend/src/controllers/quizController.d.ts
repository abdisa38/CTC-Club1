import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const createQuiz: (req: AuthRequest, res: Response) => Promise<void>;
export declare const submitQuiz: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getQuizResults: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=quizController.d.ts.map