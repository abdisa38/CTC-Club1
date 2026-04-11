"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEvents = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const apiResponse_1 = require("../utils/apiResponse");
// @desc    Get events
// @route   GET /api/events
// @access  Public (published) / Private Admin (optional unpublished)
exports.getEvents = (0, express_async_handler_1.default)(async (req, res) => {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    const upcoming = req.query.upcoming === 'true';
    const includeUnpublished = req.query.includeUnpublished === 'true' && req.user?.role === 'admin';
    const filter = { isDeleted: false };
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
    const events = await eventModel_1.default.find(filter)
        .populate('createdBy', 'name email')
        .sort({ startsAt: 1, createdAt: -1 })
        .limit(200);
    (0, apiResponse_1.sendSuccess)(res, events);
});
// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, location, startsAt, endsAt, isPublished } = req.body;
    if (!title?.trim() || !description?.trim() || !startsAt) {
        res.status(400);
        throw new Error('Title, description and startsAt are required');
    }
    const startDate = new Date(startsAt);
    if (!Number.isFinite(startDate.getTime())) {
        res.status(400);
        throw new Error('Invalid startsAt value');
    }
    let endDate;
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
    const payload = {
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
    const event = await eventModel_1.default.create(payload);
    const populated = await eventModel_1.default.findById(event._id).populate('createdBy', 'name email');
    (0, apiResponse_1.sendSuccess)(res, populated || event, { statusCode: 201, message: 'Event created successfully' });
});
// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, location, startsAt, endsAt, isPublished } = req.body;
    const event = await eventModel_1.default.findById(req.params.id);
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
    const populated = await eventModel_1.default.findById(updated._id).populate('createdBy', 'name email');
    (0, apiResponse_1.sendSuccess)(res, populated || updated, { message: 'Event updated successfully' });
});
// @desc    Soft delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = (0, express_async_handler_1.default)(async (req, res) => {
    const event = await eventModel_1.default.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    event.isDeleted = true;
    await event.save();
    (0, apiResponse_1.sendSuccess)(res, null, { message: 'Event deleted successfully' });
});
//# sourceMappingURL=eventController.js.map