import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { handleResourceUpload, handleVideoUpload } from '../middleware/uploadMiddleware';
import { uploadLessonResource, uploadLessonVideo } from '../controllers/uploadController';

const router = express.Router();

router.post(
  '/video',
  protect as any,
  authorizeRoles('instructor', 'admin'),
  handleVideoUpload as any,
  uploadLessonVideo as any
);

router.post(
  '/resource',
  protect as any,
  authorizeRoles('instructor', 'admin'),
  handleResourceUpload as any,
  uploadLessonResource as any
);

export default router;