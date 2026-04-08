import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const addLesson: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateLesson: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteLesson: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLessonsByCourse: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=lessonController.d.ts.map