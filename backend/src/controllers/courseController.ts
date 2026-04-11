import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import Course from '../models/courseModel';
import CourseReview from '../models/courseReviewModel';
import User from '../models/userModel';
import { sendSuccess } from '../utils/apiResponse';

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
    isPublished: true,
    status: 'published',
  });

  sendSuccess(res, course, { statusCode: 201, message: 'Course created successfully' });
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

  const queryFilter: any = { ...keyword, isDeleted: false };
  
  if (req.query.status) {
      queryFilter.status = req.query.status;
  } else if (!req.user || req.user.role === 'student') { 
      // Public / Students should only see published ones
      queryFilter.status = 'published';
  } // Admins and Instructors can fetch without limit if specified (dashboard logic handled separate usually)

  const count = await Course.countDocuments(queryFilter);
  const courseQuery = Course.find(queryFilter)
    .populate('instructor', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  if (!req.user) {
    courseQuery.select('-students');
  }

  const courses = await courseQuery;

  res.json({
    success: true,
    data: courses,
    courses,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get singular course
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email avatar');

  if (course) {
    sendSuccess(res, course);
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
  sendSuccess(res, updatedCourse, { message: 'Course updated successfully' });
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
  sendSuccess(res, null, { message: 'Course removed' });
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

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { enrolledCourses: course._id },
  });

  sendSuccess(res, course, { message: 'Successfully enrolled in course' });
});

const refreshCourseRatingStats = async (courseId: string) => {
  const aggregate = await CourseReview.aggregate([
    { $match: { course: courseId as any } },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = Number(aggregate[0]?.averageRating || 0);
  const reviewCount = Number(aggregate[0]?.reviewCount || 0);

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      rating: Number(averageRating.toFixed(2)),
      numReviews: reviewCount,
    },
    { new: true }
  );

  return updatedCourse;
};

// @desc    Rate a course (create or update student's rating)
// @route   POST /api/courses/:id/rate
// @access  Private/Student
export const rateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can rate courses');
  }

  const courseId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!courseId) {
    res.status(400);
    throw new Error('Course ID is required');
  }

  const { rating, comment } = req.body as { rating?: number | string; comment?: string };
  const numericRating = Number(rating);

  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    res.status(400);
    throw new Error('Rating must be a number between 1 and 5');
  }

  const course = await Course.findById(courseId).select('_id students status');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isEnrolled = Array.isArray(course.students)
    && course.students.some((studentId: any) => studentId.toString() === req.user._id.toString());

  if (!isEnrolled) {
    res.status(403);
    throw new Error('Enroll in this course before rating it');
  }

  const updatedReview = await CourseReview.findOneAndUpdate(
    {
      course: course._id,
      user: req.user._id,
    },
    {
      rating: numericRating,
      comment: typeof comment === 'string' ? comment.trim() : undefined,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  const refreshedCourse = await refreshCourseRatingStats(course._id.toString());

  sendSuccess(res, {
    courseId: course._id.toString(),
    rating: refreshedCourse?.rating || 0,
    numReviews: refreshedCourse?.numReviews || 0,
    myRating: updatedReview.rating,
    myComment: updatedReview.comment || '',
  }, { message: 'Course rating saved' });
});

// @desc    Get current student's rating for a course
// @route   GET /api/courses/:id/rate/me
// @access  Private/Student
export const getMyCourseRating = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can access course ratings');
  }

  const courseId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!courseId) {
    res.status(400);
    throw new Error('Course ID is required');
  }

  const review = await CourseReview.findOne({
    course: courseId,
    user: req.user._id,
  })
    .select('rating comment updatedAt')
    .lean();

  if (!review) {
    sendSuccess(res, null);
    return;
  }

  sendSuccess(res, {
    rating: review.rating,
    comment: review.comment || '',
    updatedAt: review.updatedAt,
  });
});
