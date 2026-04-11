import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import Event from '../models/eventModel';
import { sendSuccess } from '../utils/apiResponse';

// @desc    Get events
// @route   GET /api/events
// @access  Public (published) / Private Admin (optional unpublished)
export const getEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
  const upcoming = req.query.upcoming === 'true';
  const includeUnpublished = req.query.includeUnpublished === 'true' && req.user?.role === 'admin';

  const filter: any = { isDeleted: false };

  if (!includeUnpublished) {
    filter.isPublished = true;
  }

  if (upcoming) {
    filter.startsAt = { $gte: new Date() };
  }

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { location: { $regex: keyword, $options: 'i' } },
    ];
  }

  const events = await Event.find(filter)
    .populate('createdBy', 'name email')
    .sort({ startsAt: 1, createdAt: -1 })
    .limit(200);

  sendSuccess(res, events);
});

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, location, startsAt, endsAt, isPublished } = req.body as {
    title?: string;
    description?: string;
    location?: string;
    startsAt?: string;
    endsAt?: string;
    isPublished?: boolean;
  };

  if (!title?.trim() || !description?.trim() || !startsAt) {
    res.status(400);
    throw new Error('Title, description and startsAt are required');
  }

  const startDate = new Date(startsAt);
  if (!Number.isFinite(startDate.getTime())) {
    res.status(400);
    throw new Error('Invalid startsAt value');
  }

  let endDate: Date | undefined;
  if (endsAt) {
    const parsedEnd = new Date(endsAt);
    if (!Number.isFinite(parsedEnd.getTime())) {
      res.status(400);
      throw new Error('Invalid endsAt value');
    }
    if (parsedEnd.getTime() < startDate.getTime()) {
      res.status(400);
      throw new Error('endsAt cannot be before startsAt');
    }
    endDate = parsedEnd;
  }

  const payload: any = {
    title: title.trim(),
    description: description.trim(),
    location: location?.trim() || '',
    startsAt: startDate,
    isPublished: typeof isPublished === 'boolean' ? isPublished : true,
    createdBy: req.user._id,
  };

  if (endDate) {
    payload.endsAt = endDate;
  }

  const event = await Event.create(payload);

  const populated = await Event.findById((event as any)._id).populate('createdBy', 'name email');
  sendSuccess(res, populated || event, { statusCode: 201, message: 'Event created successfully' });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, location, startsAt, endsAt, isPublished } = req.body as {
    title?: string;
    description?: string;
    location?: string;
    startsAt?: string;
    endsAt?: string;
    isPublished?: boolean;
  };

  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (typeof title === 'string' && title.trim()) {
    event.title = title.trim();
  }

  if (typeof description === 'string' && description.trim()) {
    event.description = description.trim();
  }

  if (typeof location === 'string') {
    event.location = location.trim();
  }

  if (typeof startsAt === 'string') {
    const startDate = new Date(startsAt);
    if (!Number.isFinite(startDate.getTime())) {
      res.status(400);
      throw new Error('Invalid startsAt value');
    }
    event.startsAt = startDate;
  }

  if (typeof endsAt === 'string') {
    const endDate = new Date(endsAt);
    if (!Number.isFinite(endDate.getTime())) {
      res.status(400);
      throw new Error('Invalid endsAt value');
    }
    if (endDate.getTime() < event.startsAt.getTime()) {
      res.status(400);
      throw new Error('endsAt cannot be before startsAt');
    }
    event.endsAt = endDate;
  }

  if (typeof isPublished === 'boolean') {
    event.isPublished = isPublished;
  }

  const updated = await event.save();
  const populated = await Event.findById(updated._id).populate('createdBy', 'name email');
  sendSuccess(res, populated || updated, { message: 'Event updated successfully' });
});

// @desc    Soft delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  event.isDeleted = true;
  await event.save();

  sendSuccess(res, null, { message: 'Event deleted successfully' });
});