import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import Course from '../models/courseModel';
import User from '../models/userModel';

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
export const createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, coverImage, category, price } = req.body;

  const course = await Course.create({
    title,
    description,
    instructor: req.user._id, // the user creating it is an instructor
    coverImage,
    category,
    price,
  });

  res.status(201).json(course);
});

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword as string,
          $options: 'i',
        },
      }
    : {};

  const count = await Course.countDocuments({ ...keyword });
  const courses = await Course.find({ ...keyword })
    .populate('instructor', 'name email avatar')
    .select('-students') // Exclude heavy students array by default
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ courses, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get singular course
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email avatar')
    .slice('students', 10); // Only bring back first 10 students if ever needed for preview, prevents memory overload

  if (course) {
    res.json(course);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
export const updateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, coverImage, category, price } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if the current user is the instructor of the course or an admin
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to update this course');
  }

  course.title = title || course.title;
  course.description = description || course.description;
  course.coverImage = coverImage || course.coverImage;
  course.category = category || course.category;
  course.price = price !== undefined ? price : course.price;

  const updatedCourse = await course.save();
  res.json(updatedCourse);
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
export const deleteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to delete this course');
  }

  await course.deleteOne();
  res.json({ message: 'Course removed' });
});

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (student role etc)
export const enrollCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Use $addToSet to avoid race conditions. This guarantees a user is only added once natively by MongoDB
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { students: req.user._id } },
    { new: true } // Returns the updated document
  );

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.status(200).json({ message: 'Successfully enrolled in course' });
});
