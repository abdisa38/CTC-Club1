import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Course from '../models/courseModel';
import User from '../models/userModel';

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({}).populate('instructor', 'name email avatar');
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get singular course
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('students', 'name');

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, coverImage, category, price } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the current user is the instructor of the course or an admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this course' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.coverImage = coverImage || course.coverImage;
    course.category = category || course.category;
    course.price = price !== undefined ? price : course.price;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ message: 'Course removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (student role etc)
export const enrollCourse = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.students.find(
      (student: any) => student.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    course.students.push(req.user._id);
    await course.save();

    res.status(200).json({ message: 'Successfully enrolled in course' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
