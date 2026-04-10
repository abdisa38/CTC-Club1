import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/apiResponse';

const buildPublicUrl = (req: AuthRequest, filename: string): string => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

export const uploadLessonVideo = (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No video file uploaded' });
  }

  return sendSuccess(res, {
    url: buildPublicUrl(req, req.file.filename),
    fileType: req.file.mimetype,
    size: req.file.size,
    originalName: req.file.originalname,
    filename: req.file.filename,
  }, { message: 'Video uploaded successfully' });
};

export const uploadLessonResource = (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No resource file uploaded' });
  }

  return sendSuccess(res, {
    url: buildPublicUrl(req, req.file.filename),
    fileType: req.file.mimetype,
    size: req.file.size,
    originalName: req.file.originalname,
    filename: req.file.filename,
  }, { message: 'Resource uploaded successfully' });
};