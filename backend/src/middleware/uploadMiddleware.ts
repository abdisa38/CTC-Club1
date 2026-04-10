import fs from 'fs';
import path from 'path';
import type { RequestHandler } from 'express';
import multer from 'multer';

const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const originalExt = path.extname(file.originalname || '');
    const originalBase = path.basename(file.originalname || 'file', originalExt);
    const safeBase = originalBase.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-');
    const finalBase = safeBase || 'file';
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    cb(null, `${timestamp}-${random}-${finalBase}${originalExt}`);
  },
});

const videoUploader = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith('video/')) {
      cb(new Error('Only video files are allowed for lesson videos'));
      return;
    }

    cb(null, true);
  },
});

const resourceUploader = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export const handleVideoUpload: RequestHandler = (req, res, next) => {
  videoUploader.single('video')(req, res, (err: any) => {
    if (err) {
      res.status(err?.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
      next(err);
      return;
    }

    next();
  });
};

export const handleResourceUpload: RequestHandler = (req, res, next) => {
  resourceUploader.single('resource')(req, res, (err: any) => {
    if (err) {
      res.status(err?.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
      next(err);
      return;
    }

    next();
  });
};