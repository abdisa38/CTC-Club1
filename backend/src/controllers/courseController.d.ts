import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const createCourse: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCourses: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCourseById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateCourse: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCourse: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const enrollCourse: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=courseController.d.ts.map