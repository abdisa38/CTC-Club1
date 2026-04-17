import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Lesson from '../models/lessonModel';
import Course from '../models/courseModel';
import { sendSuccess } from '../utils/apiResponse';

const hasOwn = (value: unknown, key: string) => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(value, key);
};

const extractUrlsFromText = (input: string): string[] => {
  if (!input.trim()) {
    return [];
  }

  const matches = input.match(/https?:\/\/[^\s,]+/g) || [];
  return matches
    .map((item) => item.trim().replace(/[).,;]+$/g, ''))
    .filter(Boolean);
};

const normalizeVideoUrls = (videoUrlInput: unknown, videoUrlsInput: unknown): string[] => {
  const candidates: unknown[] = [];

  if (Array.isArray(videoUrlsInput)) {
    candidates.push(...videoUrlsInput);
  } else if (typeof videoUrlsInput === 'string') {
    candidates.push(...videoUrlsInput.split(/[\n,]+/));
  }

  if (videoUrlInput !== undefined) {
    candidates.push(videoUrlInput);
  }

  const unique = new Set<string>();

  candidates.forEach((candidate) => {
    const normalized = String(candidate ?? '').trim();
    if (!normalized) {
      return;
    }

    const extractedUrls = extractUrlsFromText(normalized);
    if (extractedUrls.length > 0) {
      extractedUrls.forEach((url) => unique.add(url));
      return;
    }

    unique.add(normalized);
  });

  return Array.from(unique);
};

const normalizeText = (value: unknown): string => String(value ?? '').trim();

const normalizeOptionalText = (value: unknown): string | undefined => {
  const normalized = normalizeText(value);
  return normalized || undefined;
};

const parseNonNegativeNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
};

const normalizeChecklist = (input: unknown): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
};

const normalizeSectionBreakdown = (input: unknown): Array<{ title: string; durationMinutes?: number }> => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const title = normalizeText(record.title);
      if (!title) {
        return null;
      }

      const durationMinutes = parseNonNegativeNumber(record.durationMinutes);
      if (durationMinutes !== undefined) {
        return {
          title,
          durationMinutes,
        };
      }

      return {
        title,
      };
    })
    .filter((entry): entry is { title: string; durationMinutes?: number } => Boolean(entry));
};

const normalizeClassNotes = (input: unknown): Array<{ title: string; url: string }> => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const title = normalizeText(record.title);
      const url = normalizeText(record.url);
      if (!title || !url) {
        return null;
      }

      return {
        title,
        url,
      };
    })
    .filter((entry): entry is { title: string; url: string } => Boolean(entry));
};

const normalizeClassQuestions = (input: unknown): Array<{ question: string; answer?: string }> => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const question = normalizeText(record.question);
      if (!question) {
        return null;
      }

      const answer = normalizeOptionalText(record.answer);
      if (answer) {
        return {
          question,
          answer,
        };
      }

      return {
        question,
      };
    })
    .filter((entry): entry is { question: string; answer?: string } => Boolean(entry));
};

const normalizeOrderValue = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

// @desc    Add a lesson to a course
// @route   POST /api/courses/:courseId/lessons
// @access  Private/Instructor
export const addLesson = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      content,
      videoUrl,
      videoUrls,
      order,
      duration,
      attachments,
      isPublished,
      phaseTitle,
      phaseOrder,
      weekTitle,
      weekOrder,
      topicTitle,
      topicOrder,
      sectionBreakdown,
      classChecklist,
      classNotes,
      classQuestions,
    } = req.body;
    const courseId = typeof req.params.courseId === 'string' ? req.params.courseId : '';

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify ownership or roles if needed (instructor check handled in middleware mostly)
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
    }

    const lessonPayload: any = {
      title,
      content: content || title,
      course: courseId,
      attachments: Array.isArray(attachments) ? attachments : [],
      sectionBreakdown: normalizeSectionBreakdown(sectionBreakdown),
      classChecklist: normalizeChecklist(classChecklist),
      classNotes: normalizeClassNotes(classNotes),
      classQuestions: normalizeClassQuestions(classQuestions),
    };

    const normalizedVideoUrls = normalizeVideoUrls(videoUrl, videoUrls);
    if (normalizedVideoUrls.length > 0) {
      lessonPayload.videoUrls = normalizedVideoUrls;
      lessonPayload.videoUrl = normalizedVideoUrls[0];
    }

    if (order !== undefined) {
      const parsedOrder = parseNonNegativeNumber(order);
      if (parsedOrder !== undefined) {
        lessonPayload.order = parsedOrder;
      }
    }

    if (duration !== undefined) {
      const parsedDuration = Number(duration);
      if (Number.isFinite(parsedDuration)) {
        lessonPayload.duration = parsedDuration;
      }
    }

    if (typeof isPublished === 'boolean') {
      lessonPayload.isPublished = isPublished;
    }

    const normalizedPhaseTitle = normalizeOptionalText(phaseTitle);
    if (normalizedPhaseTitle) {
      lessonPayload.phaseTitle = normalizedPhaseTitle;
    }

    const normalizedPhaseOrder = parseNonNegativeNumber(phaseOrder);
    if (normalizedPhaseOrder !== undefined) {
      lessonPayload.phaseOrder = normalizedPhaseOrder;
    }

    const normalizedWeekTitle = normalizeOptionalText(weekTitle);
    if (normalizedWeekTitle) {
      lessonPayload.weekTitle = normalizedWeekTitle;
    }

    const normalizedWeekOrder = parseNonNegativeNumber(weekOrder);
    if (normalizedWeekOrder !== undefined) {
      lessonPayload.weekOrder = normalizedWeekOrder;
    }

    const normalizedTopicTitle = normalizeOptionalText(topicTitle);
    if (normalizedTopicTitle) {
      lessonPayload.topicTitle = normalizedTopicTitle;
    }

    const normalizedTopicOrder = parseNonNegativeNumber(topicOrder);
    if (normalizedTopicOrder !== undefined) {
      lessonPayload.topicOrder = normalizedTopicOrder;
    }

    const lesson = await Lesson.create(lessonPayload);

    sendSuccess(res, lesson, { statusCode: 201, message: 'Lesson created successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lesson
// @route   PUT /api/courses/lessons/:lessonId
// @access  Private/Instructor
export const updateLesson = async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = typeof req.params.lessonId === 'string' ? req.params.lessonId : '';
    const {
      title,
      content,
      videoUrl,
      videoUrls,
      order,
      duration,
      attachments,
      isPublished,
      phaseTitle,
      phaseOrder,
      weekTitle,
      weekOrder,
      topicTitle,
      topicOrder,
      sectionBreakdown,
      classChecklist,
      classNotes,
      classQuestions,
    } = req.body;

    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson ID is required' });
    }

    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course: any = lesson.course;
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    if (title !== undefined) {
      const normalizedTitle = normalizeText(title);
      if (normalizedTitle) {
        lesson.title = normalizedTitle;
      }
    }

    if (content !== undefined) {
      const normalizedContent = normalizeText(content);
      if (normalizedContent) {
        lesson.content = normalizedContent;
      }
    }

    if (videoUrl !== undefined || videoUrls !== undefined) {
      const normalizedVideoUrls = normalizeVideoUrls(videoUrl, videoUrls);
      lesson.videoUrls = normalizedVideoUrls;
      lesson.set('videoUrl', normalizedVideoUrls[0] || undefined);
    }

    if (order !== undefined) {
      const parsedOrder = parseNonNegativeNumber(order);
      if (parsedOrder !== undefined) {
        lesson.order = parsedOrder;
      }
    }
    if (duration !== undefined) {
      const parsedDuration = Number(duration);
      if (Number.isFinite(parsedDuration)) {
        lesson.duration = parsedDuration;
      }
    }

    if (Array.isArray(attachments)) {
      lesson.attachments = attachments;
    }

    if (typeof isPublished === 'boolean') {
      lesson.isPublished = isPublished;
    }

    if (hasOwn(req.body, 'phaseTitle')) {
      lesson.set('phaseTitle', normalizeOptionalText(phaseTitle));
    }

    if (hasOwn(req.body, 'phaseOrder')) {
      lesson.set('phaseOrder', parseNonNegativeNumber(phaseOrder));
    }

    if (hasOwn(req.body, 'weekTitle')) {
      lesson.set('weekTitle', normalizeOptionalText(weekTitle));
    }

    if (hasOwn(req.body, 'weekOrder')) {
      lesson.set('weekOrder', parseNonNegativeNumber(weekOrder));
    }

    if (hasOwn(req.body, 'topicTitle')) {
      lesson.set('topicTitle', normalizeOptionalText(topicTitle));
    }

    if (hasOwn(req.body, 'topicOrder')) {
      lesson.set('topicOrder', parseNonNegativeNumber(topicOrder));
    }

    if (hasOwn(req.body, 'sectionBreakdown')) {
      lesson.sectionBreakdown = normalizeSectionBreakdown(sectionBreakdown);
    }

    if (hasOwn(req.body, 'classChecklist')) {
      lesson.classChecklist = normalizeChecklist(classChecklist);
    }

    if (hasOwn(req.body, 'classNotes')) {
      lesson.classNotes = normalizeClassNotes(classNotes);
    }

    if (hasOwn(req.body, 'classQuestions')) {
      lesson.classQuestions = normalizeClassQuestions(classQuestions);
    }

    const updatedLesson = await lesson.save();
    sendSuccess(res, updatedLesson, { message: 'Lesson updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/courses/lessons/:lessonId
// @access  Private/Instructor
export const deleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = typeof req.params.lessonId === 'string' ? req.params.lessonId : '';

    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson ID is required' });
    }

    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course: any = lesson.course;
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    await lesson.deleteOne();
    sendSuccess(res, null, { message: 'Lesson removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lessons by course
// @route   GET /api/courses/:courseId/lessons
// @access  Public or Student (depends on business logic, here we'll make it protected for enrolled students/instructor)
export const getLessonsByCourse = async (req: AuthRequest, res: Response) => {
  try {
    const courseId = typeof req.params.courseId === 'string' ? req.params.courseId : '';

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId).select('price students instructor');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isPrivilegedUser = req.user.role === 'admin' || String(course.instructor) === String(req.user._id);
    const isPaidCourse = Number(course.price || 0) > 0;
    const isEnrolled = Array.isArray(course.students)
      && course.students.some((studentId: any) => String(studentId) === String(req.user._id));

    if (isPaidCourse && !isPrivilegedUser && !isEnrolled) {
      return res.status(403).json({ message: 'Enroll in this paid course to access lessons' });
    }

    const grouped = String(req.query.grouped || '').trim().toLowerCase() === 'true';

    const lessons = await Lesson.find({ course: courseId }).sort({
      phaseOrder: 1,
      weekOrder: 1,
      topicOrder: 1,
      order: 1,
      createdAt: 1,
    });

    if (grouped) {
      type LessonTopicGroup = {
        key: string;
        title: string;
        order: number;
        lessons: any[];
      };

      type LessonWeekGroup = {
        key: string;
        title: string;
        order: number;
        topics: Map<string, LessonTopicGroup>;
      };

      type LessonPhaseGroup = {
        key: string;
        title: string;
        order: number;
        weeks: Map<string, LessonWeekGroup>;
      };

      const phases = new Map<string, LessonPhaseGroup>();

      lessons.forEach((lesson, index) => {
        const fallbackOrder = normalizeOrderValue(lesson.order, index);

        const phaseTitle = normalizeOptionalText(lesson.phaseTitle) || 'General Phase';
        const phaseOrder = normalizeOrderValue(lesson.phaseOrder, 0);
        const phaseKey = `${phaseOrder}-${phaseTitle.toLowerCase()}`;

        const weekTitle = normalizeOptionalText(lesson.weekTitle) || 'General Week';
        const weekOrder = normalizeOrderValue(lesson.weekOrder, fallbackOrder);
        const weekKey = `${weekOrder}-${weekTitle.toLowerCase()}`;

        const topicTitle = normalizeOptionalText(lesson.topicTitle) || lesson.title;
        const topicOrder = normalizeOrderValue(lesson.topicOrder, fallbackOrder);
        const topicKey = `${topicOrder}-${topicTitle.toLowerCase()}`;

        let phaseGroup = phases.get(phaseKey);
        if (!phaseGroup) {
          phaseGroup = {
            key: phaseKey,
            title: phaseTitle,
            order: phaseOrder,
            weeks: new Map<string, LessonWeekGroup>(),
          };
          phases.set(phaseKey, phaseGroup);
        }

        let weekGroup = phaseGroup.weeks.get(weekKey);
        if (!weekGroup) {
          weekGroup = {
            key: weekKey,
            title: weekTitle,
            order: weekOrder,
            topics: new Map<string, LessonTopicGroup>(),
          };
          phaseGroup.weeks.set(weekKey, weekGroup);
        }

        let topicGroup = weekGroup.topics.get(topicKey);
        if (!topicGroup) {
          topicGroup = {
            key: topicKey,
            title: topicTitle,
            order: topicOrder,
            lessons: [],
          };
          weekGroup.topics.set(topicKey, topicGroup);
        }

        topicGroup.lessons.push(lesson);
      });

      const groupedPhases = Array.from(phases.values())
        .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
        .map((phaseGroup) => ({
          key: phaseGroup.key,
          title: phaseGroup.title,
          order: phaseGroup.order,
          weeks: Array.from(phaseGroup.weeks.values())
            .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
            .map((weekGroup) => ({
              key: weekGroup.key,
              title: weekGroup.title,
              order: weekGroup.order,
              topics: Array.from(weekGroup.topics.values())
                .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
                .map((topicGroup) => ({
                  key: topicGroup.key,
                  title: topicGroup.title,
                  order: topicGroup.order,
                  lessons: topicGroup.lessons,
                })),
            })),
        }));

      sendSuccess(res, {
        lessons,
        phases: groupedPhases,
      });
      return;
    }

    sendSuccess(res, lessons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
