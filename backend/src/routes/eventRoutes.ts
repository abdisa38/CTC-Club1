import express from 'express';
import { authorizeRoles, optionalProtect, protect } from '../middleware/authMiddleware';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';

const router = express.Router();

router.get('/', optionalProtect as any, getEvents as any);
router.post('/', protect as any, authorizeRoles('admin'), createEvent as any);
router.put('/:id', protect as any, authorizeRoles('admin'), updateEvent as any);
router.delete('/:id', protect as any, authorizeRoles('admin'), deleteEvent as any);

export default router;