import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/userModel';
import Course from '../models/courseModel';
import Progress from '../models/progressModel';
import Ticket from '../models/ticketModel';
import Lesson from '../models/lessonModel';
import Event from '../models/eventModel';
import { Project, ProjectSubmission } from '../models/projectModel';
import { QuizResult } from '../models/quizModel';
import Notification from '../models/notificationModel';
import { CommunityPost } from '../models/communityModel';
import { sendSuccess } from '../utils/apiResponse';

const toIsoDayKey = (date: Date) => date.toISOString().split('T')[0];

const buildLastSevenDays = () => {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        days.push(d);
    }
    return days;
};

const toMonthKey = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const toValidDate = (value: unknown): Date | null => {
    if (!value) {
        return null;
    }

    const candidate = new Date(value as string | number | Date);
    if (Number.isNaN(candidate.getTime())) {
        return null;
    }

    return candidate;
};

const monthDiffInclusive = (start: Date, end: Date) => {
    const years = end.getUTCFullYear() - start.getUTCFullYear();
    const months = end.getUTCMonth() - start.getUTCMonth();
    return (years * 12) + months + 1;
};

const buildMonthlyTimeline = (totalMonths: number) => {
    const now = new Date();
    const monthCount = Math.max(1, totalMonths);
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthCount - 1), 1));

    return Array.from({ length: monthCount }, (_, idx) => {
        const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + idx, 1));
        return {
            key: toMonthKey(date),
            label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
            date: date.toISOString(),
        };
    });
};

const buildAdminMetrics = async () => {
    const [totalUsers, totalCourses, openTickets, recentUsers] = await Promise.all([
        User.countDocuments({ isDeleted: false }),
        Course.countDocuments({ isDeleted: false }),
        Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
        User.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(10).select('-password'),
    ]);

    const estimatedRevenueAgg = await Course.aggregate([
        { $match: { isDeleted: false, status: 'published' } },
        {
            $project: {
                revenue: { $multiply: ['$price', { $size: '$students' }] },
            },
        },
        { $group: { _id: null, total: { $sum: '$revenue' } } },
    ]);

    const lastSevenDays = buildLastSevenDays();
    const progressActivity = await Progress.aggregate([
        { $match: { updatedAt: { $gte: lastSevenDays[0] } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                count: { $sum: 1 },
            },
        },
    ]);

    const activityMap = new Map(progressActivity.map((item: any) => [item._id, item.count]));
    const userActivityData = lastSevenDays.map((day) => ({
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        active: activityMap.get(toIsoDayKey(day)) || 0,
    }));

    const courseCompletionData = await Progress.aggregate([
        { $match: { isCompleted: true } },
        { $group: { _id: '$course', completed: { $sum: 1 } } },
        { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        { $project: { _id: 0, name: '$course.title', completed: 1 } },
        { $sort: { completed: -1 } },
        { $limit: 8 },
    ]);

    const ticketStatusRaw = await Ticket.aggregate([
        { $group: { _id: '$status', value: { $sum: 1 } } },
    ]);
    const ticketStatusData = [
        { name: 'Open', key: 'open' },
        { name: 'In Progress', key: 'in_progress' },
        { name: 'Resolved', key: 'resolved' },
        { name: 'Closed', key: 'closed' },
    ].map((s) => ({
        name: s.name,
        value: ticketStatusRaw.find((row: any) => row._id === s.key)?.value || 0,
    }));

    const [recentCourses, recentTickets] = await Promise.all([
        Course.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(8).populate('instructor', 'name'),
        Ticket.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(8).populate('user', 'name'),
    ]);

    const ratingAggregate = await Course.aggregate([
        { $match: { isDeleted: false, status: 'published' } },
        {
            $group: {
                _id: null,
                totalReviews: { $sum: { $ifNull: ['$numReviews', 0] } },
                weightedRatingTotal: {
                    $sum: {
                        $multiply: [
                            { $ifNull: ['$rating', 0] },
                            { $ifNull: ['$numReviews', 0] },
                        ],
                    },
                },
                ratedCourses: {
                    $sum: {
                        $cond: [{ $gt: [{ $ifNull: ['$numReviews', 0] }, 0] }, 1, 0],
                    },
                },
            },
        },
    ]);

    const totalReviews = Number(ratingAggregate[0]?.totalReviews || 0);
    const weightedRatingTotal = Number(ratingAggregate[0]?.weightedRatingTotal || 0);
    const ratedCourses = Number(ratingAggregate[0]?.ratedCourses || 0);
    const avgCourseRating = totalReviews > 0
        ? Number((weightedRatingTotal / totalReviews).toFixed(2))
        : 0;

    const activityLogs = [
        ...recentUsers.map((u: any) => ({
            id: `user-${u._id}`,
            action: 'New user registered',
            user: u.name,
            time: u.createdAt,
            type: 'user',
        })),
        ...recentCourses.map((c: any) => ({
            id: `course-${c._id}`,
            action: 'Course created',
            user: c.instructor?.name || 'Instructor',
            time: c.createdAt,
            type: 'course',
        })),
        ...recentTickets.map((t: any) => ({
            id: `ticket-${t._id}`,
            action: 'Support ticket opened',
            user: t.user?.name || 'User',
            time: t.createdAt,
            type: 'ticket',
        })),
    ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 15);

    return {
        totals: { users: totalUsers, courses: totalCourses },
        openTickets,
        ratings: {
            avgCourseRating,
            totalReviews,
            ratedCourses,
        },
        // Real collected revenue requires payment transaction tracking.
        collectedRevenue: 0,
        totalRevenue: 0,
        estimatedRevenue: estimatedRevenueAgg[0]?.total || 0,
        recentUsers,
        userActivityData,
        courseCompletionData,
        ticketStatusData,
        activityLogs,
    };
};

// @desc    Get dashboard metrics based on role
// @route   GET /api/dashboard/metrics
// @access  Private
export const getDashboardMetrics = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const role = req.user.role;

    if (role === 'admin') {
                const metrics = await buildAdminMetrics();
                sendSuccess(res, metrics);
        return;
    } 
    
    if (role === 'instructor') {
        const totalCourses = await Course.countDocuments({ instructor: req.user._id, isDeleted: false });
        
        // Sum total students across all instructor courses
        const instructorCourses = await Course.find({ instructor: req.user._id, isDeleted: false }).select('students price title rating numReviews');
        let totalStudents = 0;
        let totalRevenue = 0; 
        let totalReviews = 0;
        let weightedRatingTotal = 0;
        
        for(let c of instructorCourses) {
            totalStudents += c.students.length;
            totalRevenue += (c.students.length * c.price);
            const reviewCount = Number(c.numReviews || 0);
            const ratingValue = Number(c.rating || 0);
            totalReviews += reviewCount;
            weightedRatingTotal += (reviewCount * ratingValue);
        }

        const avgCourseRating = totalReviews > 0
            ? Number((weightedRatingTotal / totalReviews).toFixed(2))
            : 0;

        // Submissions waiting to be graded
        const pendingSubmissions = await ProjectSubmission.countDocuments({ 
            course: { $in: instructorCourses.map(c => c._id) },
            status: { $in: ['submitted', 'under_review'] }
        });

        const latestSubmissions = await ProjectSubmission.find({
            course: { $in: instructorCourses.map(c => c._id) },
        })
            .populate('student', 'name avatar')
            .populate('project', 'title')
            .sort({ updatedAt: -1 })
            .limit(8);

        sendSuccess(res, {
            totalCourses,
            totalStudents,
            totalRevenue,
            avgCourseRating,
            totalReviews,
            pendingSubmissions,
            latestSubmissions,
            coursePerformance: instructorCourses.map((course: any) => ({
                name: course.title,
                students: course.students.length,
                revenue: course.students.length * course.price,
                rating: Number(course.rating || 0),
                numReviews: Number(course.numReviews || 0),
            })),
        });
        return;
    }

    // Role is Student
    const student = await User.findById(req.user._id)
        .select('xp level enrolledCourses')
        .lean();

    if (!student) {
        res.status(404);
        throw new Error('User not found');
    }

    const userProgress = await Progress.find({ user: req.user._id }).populate({
        path: 'course',
        select: 'title coverImage totalDuration'
    });

    const enrolledCourseIdsFromUser = Array.isArray((student as any).enrolledCourses)
        ? (student as any).enrolledCourses.map((id: any) => id.toString())
        : [];

    const getProgressCourseId = (progress: any) => {
        if (!progress?.course) {
            return '';
        }

        if (typeof progress.course === 'string') {
            return progress.course;
        }

        return progress.course?._id?.toString() || '';
    };

    const progressCourseIds = userProgress
        .map((progress: any) => getProgressCourseId(progress))
        .filter(Boolean);

    const progressCourseIdSet = new Set(progressCourseIds);
    const uniqueEnrolledCourseIds = Array.from(new Set([...enrolledCourseIdsFromUser, ...progressCourseIds]));
    const missingProgressCourseIds = uniqueEnrolledCourseIds.filter((courseId) => !progressCourseIdSet.has(courseId));

    const missingProgressCourses = missingProgressCourseIds.length > 0
        ? await Course.find({
            _id: { $in: missingProgressCourseIds },
            isDeleted: false,
        }).select('title coverImage totalDuration')
        : [];

    const syntheticActiveProgress = missingProgressCourses.map((course: any) => ({
        _id: `enrolled-${course._id.toString()}`,
        user: req.user._id,
        course: {
            _id: course._id,
            title: course.title,
            coverImage: course.coverImage,
            totalDuration: course.totalDuration,
        },
        progressPercentage: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));

    const completedCourseIds = new Set(
        userProgress
            .filter((progress: any) => progress.isCompleted)
            .map((progress: any) => getProgressCourseId(progress))
            .filter(Boolean)
    );

    const activeProgressMap = new Map<string, any>();
    userProgress
        .filter((progress: any) => !progress.isCompleted)
        .forEach((progress: any) => {
            const courseId = getProgressCourseId(progress);
            if (!courseId) {
                return;
            }

            const existing = activeProgressMap.get(courseId);
            if (!existing) {
                activeProgressMap.set(courseId, progress);
                return;
            }

            const existingUpdatedAt = new Date(existing.updatedAt || 0).getTime();
            const currentUpdatedAt = new Date(progress.updatedAt || 0).getTime();
            if (currentUpdatedAt >= existingUpdatedAt) {
                activeProgressMap.set(courseId, progress);
            }
        });

    syntheticActiveProgress.forEach((progress: any) => {
        const courseId = getProgressCourseId(progress);
        if (!courseId || activeProgressMap.has(courseId)) {
            return;
        }

        activeProgressMap.set(courseId, progress);
    });

    const enrolledCourses = uniqueEnrolledCourseIds.length;
    const completedCourses = completedCourseIds.size;
    const activeProgress = Array.from(activeProgressMap.values());

    const [notifications, quizResults, projectSubmissions] = await Promise.all([
        Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10),
        QuizResult.find({ user: req.user._id }).populate('quiz', 'title').sort({ createdAt: -1 }).limit(10),
        ProjectSubmission.find({ student: req.user._id })
            .populate('project', 'title')
            .populate('course', 'title')
            .sort({ updatedAt: -1 })
            .limit(10),
    ]);

    sendSuccess(res, {
        xp: Number((student as any).xp ?? req.user.xp ?? 0),
        level: Number((student as any).level ?? req.user.level ?? 1),
        enrolledCourses,
        completedCourses,
        activeCourses: activeProgress,
        activeStreak: 0,
        notifications,
        quizResults,
        projectSubmissions,
    });
});

// @desc    Get admin analytics payload
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
export const getAdminAnalytics = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admins can access analytics');
    }

    const analytics = await buildAdminMetrics();
    sendSuccess(res, analytics);
});

// @desc    Get leaderboard
// @route   GET /api/dashboard/leaderboard
// @access  Private
export const getLeaderboard = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const users = await User.find({ isDeleted: false, role: 'student' })
        .sort({ xp: -1, createdAt: 1 })
        .limit(100)
        .select('name avatar xp level role');

    const leaderboard = users.map((u: any, index: number) => ({
        rank: index + 1,
        id: u._id,
        name: u.name,
        avatar: u.avatar,
        xp: u.xp || 0,
        level: u.level || 1,
        role: u.role,
    }));

    sendSuccess(res, leaderboard);
});

// @desc    Get dashboard resources from lessons/attachments
// @route   GET /api/dashboard/resources
// @access  Private
export const getDashboardResources = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const filter: any = { isDeleted: false };
    if (req.user.role === 'student') {
        filter.isPublished = true;
    }

    const lessons = await Lesson.find(filter)
        .populate('course', 'title category')
        .sort({ updatedAt: -1 })
        .limit(150);

    const resources = lessons.flatMap((lesson: any) => {
        const courseTitle = lesson.course?.title || 'General';
        const courseCategory = lesson.course?.category || 'General';
        const items: any[] = [];

        if (Array.isArray(lesson.attachments)) {
            lesson.attachments.forEach((attachment: any, index: number) => {
                const fileType = String(attachment.fileType || 'file').toLowerCase();
                const url = String(attachment.url || '');
                const isVideoAttachment = fileType.includes('video') || /\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(url);
                if (isVideoAttachment) {
                    return;
                }

                items.push({
                    id: `attachment-${lesson._id}-${index}`,
                    title: attachment.title || `${lesson.title} Resource`,
                    type: attachment.fileType || 'file',
                    size: '-',
                    course: courseTitle,
                    courseCategory,
                    url: attachment.url,
                    date: lesson.updatedAt,
                });
            });
        }

        return items;
    });

    sendSuccess(res, resources);
});

// @desc    Get announcements for homepage
// @route   GET /api/dashboard/announcements
// @access  Public
export const getDashboardAnnouncements = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const posts = await CommunityPost.find({ category: 'announcement', isDeleted: false })
        .populate('user', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(6);

    if (posts.length > 0) {
        const announcements = posts.map((post: any) => ({
            id: post._id,
            title: post.title,
            content: post.content,
            author: post.user?.name || 'CTC Team',
            createdAt: post.createdAt,
            category: post.category,
        }));

        sendSuccess(res, announcements);
        return;
    }

    const fallbackFromCourses = await Course.find({ isDeleted: false, status: 'published' })
        .populate('instructor', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

    const announcements = fallbackFromCourses.map((course: any) => ({
        id: course._id,
        title: `New Course: ${course.title}`,
        content: course.shortDescription || course.description,
        author: course.instructor?.name || 'CTC Team',
        createdAt: course.createdAt,
        category: 'announcement',
    }));

    sendSuccess(res, announcements);
});

// @desc    Get public stats for the homepage
// @route   GET /api/dashboard/public-stats
// @access  Public
export const getPublicStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const totalUsers = await User.countDocuments({ role: 'student', isDeleted: false });
    const totalCourses = await Course.countDocuments({ isDeleted: false, status: 'published' });
    const expertInstructors = await User.countDocuments({ role: 'instructor', isDeleted: false });
    
    // As a fun proxy for "certificates issued", we can use total completed courses across all students
    const totalCompleted = await Progress.countDocuments({ isCompleted: true });

    sendSuccess(res, {
        activeStudents: totalUsers,
        videoCourses: totalCourses,
        instructors: expertInstructors,
        certificates: totalCompleted,
    });
});

// @desc    Get instructor students with aggregate stats
// @route   GET /api/dashboard/instructor/students
// @access  Private/Instructor/Admin
export const getInstructorStudents = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const role = req.user.role;
    if (role !== 'instructor' && role !== 'admin') {
        res.status(403);
        throw new Error('Only instructors and admins can access instructor students');
    }

    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : '';
    const instructorId = role === 'admin' && typeof req.query.instructorId === 'string'
        ? req.query.instructorId
        : req.user._id.toString();

    const courseFilter: any = { isDeleted: false };
    if (role === 'instructor' || instructorId) {
        courseFilter.instructor = instructorId;
    }
    if (courseId) {
        courseFilter._id = courseId;
    }

    const instructorCourses = await Course.find(courseFilter)
        .select('_id title students instructor')
        .lean();

    const courseSummaries = instructorCourses.map((course: any) => ({
        _id: course._id.toString(),
        title: course.title,
    }));

    const uniqueStudentIds = new Set<string>();
    instructorCourses.forEach((course: any) => {
        const students = Array.isArray(course.students) ? course.students : [];
        students.forEach((studentId: any) => {
            uniqueStudentIds.add(studentId.toString());
        });
    });

    const studentIds = Array.from(uniqueStudentIds);

    if (studentIds.length === 0) {
        sendSuccess(res, {
            summary: {
                totalEnrolled: 0,
                avgCompletionRate: 0,
                activeThisWeek: 0,
            },
            courses: courseSummaries,
            students: [],
        });
        return;
    }

    const [students, progresses] = await Promise.all([
        User.find({ _id: { $in: studentIds }, isDeleted: false })
            .select('name email avatar isActive lastLogin createdAt updatedAt')
            .lean(),
        Progress.find({
            user: { $in: studentIds },
            course: { $in: instructorCourses.map((c: any) => c._id) },
        })
            .select('user course progressPercentage isCompleted updatedAt')
            .lean(),
    ]);

    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    const studentRecords = students
        .map((student: any) => {
            const studentId = student._id.toString();

            const enrolledCourses = instructorCourses
                .filter((course: any) => (Array.isArray(course.students) ? course.students : []).some((id: any) => id.toString() === studentId))
                .map((course: any) => ({ _id: course._id.toString(), title: course.title }));

            const studentProgress = progresses.filter((progress: any) => progress.user.toString() === studentId);

            const avgProgress = studentProgress.length > 0
                ? Math.round(studentProgress.reduce((sum: number, item: any) => sum + (item.progressPercentage || 0), 0) / studentProgress.length)
                : 0;

            const allCompleted = studentProgress.length > 0 && studentProgress.every((progress: any) => progress.isCompleted);

            const candidateTimestamps = [
                ...(studentProgress.map((progress: any) => new Date(progress.updatedAt).getTime()).filter((value: number) => Number.isFinite(value))),
                student.lastLogin ? new Date(student.lastLogin).getTime() : 0,
                student.updatedAt ? new Date(student.updatedAt).getTime() : 0,
                student.createdAt ? new Date(student.createdAt).getTime() : 0,
            ].filter((value: number) => value > 0);

            const lastActiveAtMs = candidateTimestamps.length > 0 ? Math.max(...candidateTimestamps) : 0;
            const isActiveThisWeek = lastActiveAtMs > 0 && (now - lastActiveAtMs) <= oneWeekMs;

            const status = allCompleted
                ? 'completed'
                : (student.isActive !== false && isActiveThisWeek ? 'active' : 'inactive');

            return {
                id: studentId,
                name: student.name,
                email: student.email,
                avatar: student.avatar,
                enrolledAt: student.createdAt,
                lastActiveAt: lastActiveAtMs > 0 ? new Date(lastActiveAtMs).toISOString() : null,
                isActive: student.isActive !== false,
                progress: avgProgress,
                status,
                courses: enrolledCourses,
            };
        })
        .filter((student: any) => {
            if (!keyword) return true;
            return (
                student.name.toLowerCase().includes(keyword)
                || student.email.toLowerCase().includes(keyword)
                || student.courses.some((course: any) => course.title.toLowerCase().includes(keyword))
            );
        });

    const avgCompletionRate = studentRecords.length > 0
        ? Math.round(studentRecords.reduce((sum: number, student: any) => sum + (student.progress || 0), 0) / studentRecords.length)
        : 0;

    const activeThisWeek = studentRecords.filter((student: any) => {
        if (!student.lastActiveAt) return false;
        const ts = new Date(student.lastActiveAt).getTime();
        return Number.isFinite(ts) && (now - ts) <= oneWeekMs;
    }).length;

    sendSuccess(res, {
        summary: {
            totalEnrolled: studentRecords.length,
            avgCompletionRate,
            activeThisWeek,
        },
        courses: courseSummaries,
        students: studentRecords,
    });
});

// @desc    Get instructor analytics
// @route   GET /api/dashboard/instructor/analytics
// @access  Private/Instructor/Admin
export const getInstructorAnalytics = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const role = req.user.role;
    if (role !== 'instructor' && role !== 'admin') {
        res.status(403);
        throw new Error('Only instructors and admins can access instructor analytics');
    }

    const instructorId = role === 'admin' && typeof req.query.instructorId === 'string'
        ? req.query.instructorId
        : req.user._id.toString();

    const instructorCourses = await Course.find({
        instructor: instructorId,
        isDeleted: false,
    })
        .select('_id title students price rating numReviews createdAt')
        .lean();

    const courseIds = instructorCourses.map((course: any) => course._id);

    const progresses = courseIds.length > 0
        ? await Progress.find({ course: { $in: courseIds } })
            .select('course progressPercentage isCompleted createdAt completionDate updatedAt')
            .lean()
        : [];

    const coursePriceMap = new Map<string, number>();
    const progressByCourse = new Map<string, any[]>();

    instructorCourses.forEach((course: any) => {
        const courseId = course._id.toString();
        coursePriceMap.set(courseId, Number(course.price) || 0);
        progressByCourse.set(courseId, []);
    });

    progresses.forEach((entry: any) => {
        const courseId = entry.course.toString();
        const current = progressByCourse.get(courseId) || [];
        current.push(entry);
        progressByCourse.set(courseId, current);
    });

    const totalEnrollments = instructorCourses.reduce((sum: number, course: any) => {
        const enrolled = Array.isArray(course.students) ? course.students.length : 0;
        return sum + enrolled;
    }, 0);

    const totalRevenue = instructorCourses.reduce((sum: number, course: any) => {
        const enrolled = Array.isArray(course.students) ? course.students.length : 0;
        const price = Number(course.price) || 0;
        return sum + (enrolled * price);
    }, 0);

    const totalReviews = instructorCourses.reduce((sum: number, course: any) => sum + (Number(course.numReviews) || 0), 0);
    const weightedRatingSum = instructorCourses.reduce(
        (sum: number, course: any) => sum + ((Number(course.rating) || 0) * (Number(course.numReviews) || 0)),
        0,
    );
    const avgCourseRating = totalReviews > 0 ? Number((weightedRatingSum / totalReviews).toFixed(2)) : 0;

    const completedCount = progresses.filter((entry: any) => entry.isCompleted).length;
    const inProgressCount = progresses.filter((entry: any) => !entry.isCompleted && (entry.progressPercentage || 0) > 0).length;
    const notStartedCount = progresses.filter((entry: any) => !entry.isCompleted && (entry.progressPercentage || 0) <= 0).length;

    const sortedProgressDates = progresses
        .map((entry: any) => toValidDate(entry.createdAt))
        .filter((date: Date | null): date is Date => date !== null)
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());

    const now = new Date();
    const earliestDate = sortedProgressDates[0]
        ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const firstMonth = new Date(Date.UTC(earliestDate.getUTCFullYear(), earliestDate.getUTCMonth(), 1));
    const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const totalMonths = monthDiffInclusive(firstMonth, currentMonth);

    const trendTimeline = buildMonthlyTimeline(totalMonths);
    const trendMap = new Map(
        trendTimeline.map((month) => [
            month.key,
            {
                month: month.label,
                date: month.date,
                revenue: 0,
                enrollments: 0,
                completions: 0,
            },
        ]),
    );

    progresses.forEach((entry: any) => {
        const courseId = entry.course.toString();
        const coursePrice = coursePriceMap.get(courseId) || 0;

        const enrollmentDate = toValidDate(entry.createdAt);
        if (enrollmentDate) {
            const key = toMonthKey(enrollmentDate);
            const bucket = trendMap.get(key);
            if (bucket) {
                bucket.enrollments += 1;
                bucket.revenue += coursePrice;
            }
        }

        if (entry.isCompleted) {
            const completionDate = toValidDate(entry.completionDate) || toValidDate(entry.updatedAt) || enrollmentDate;
            if (completionDate) {
                const key = toMonthKey(completionDate);
                const bucket = trendMap.get(key);
                if (bucket) {
                    bucket.completions += 1;
                }
            }
        }
    });

    const trends = trendTimeline.map((month) => (
        trendMap.get(month.key) || {
            month: month.label,
            date: month.date,
            revenue: 0,
            enrollments: 0,
            completions: 0,
        }
    ));

    const coursePerformance = instructorCourses
        .map((course: any) => {
            const courseId = course._id.toString();
            const courseProgresses = progressByCourse.get(courseId) || [];
            const enrollments = Array.isArray(course.students) ? course.students.length : 0;
            const completions = courseProgresses.filter((entry: any) => entry.isCompleted).length;
            const revenue = enrollments * (Number(course.price) || 0);

            return {
                courseId,
                name: course.title,
                enrollments,
                completions,
                revenue,
                rating: Number(course.rating) || 0,
                reviews: Number(course.numReviews) || 0,
            };
        })
        .sort((a, b) => {
            if (b.revenue !== a.revenue) {
                return b.revenue - a.revenue;
            }
            if (b.enrollments !== a.enrollments) {
                return b.enrollments - a.enrollments;
            }
            return b.completions - a.completions;
        })
        .slice(0, 8);

    sendSuccess(res, {
        summary: {
            totalRevenue,
            totalEnrollments,
            avgCourseRating,
            courseCompletions: completedCount,
        },
        trends,
        progressStatus: [
            { name: 'Completed', value: completedCount },
            { name: 'In Progress', value: inProgressCount },
            { name: 'Not Started', value: notStartedCount },
        ],
        coursePerformance,
        generatedAt: new Date().toISOString(),
    });
});

// @desc    Global admin search
// @route   GET /api/dashboard/admin/search
// @access  Private/Admin
export const getAdminGlobalSearch = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admins can search platform data');
    }

    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length < 2) {
        sendSuccess(res, {
            query,
            items: [],
            counts: {
                users: 0,
                courses: 0,
                tickets: 0,
                announcements: 0,
                events: 0,
            },
        });
        return;
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const [users, courses, tickets, announcements, events] = await Promise.all([
        User.find({
            isDeleted: false,
            $or: [
                { name: { $regex: regex } },
                { email: { $regex: regex } },
            ],
        })
            .select('name email role')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        Course.find({
            isDeleted: false,
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } },
            ],
        })
            .select('_id title category status')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        Ticket.find({
            isDeleted: false,
            $or: [
                { subject: { $regex: regex } },
                { category: { $regex: regex } },
            ],
        })
            .select('_id subject status priority')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        CommunityPost.find({
            isDeleted: false,
            category: 'announcement',
            $or: [
                { title: { $regex: regex } },
                { content: { $regex: regex } },
            ],
        })
            .select('_id title createdAt')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        Event.find({
            isDeleted: false,
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } },
                { location: { $regex: regex } },
            ],
        })
            .select('_id title startsAt isPublished')
            .sort({ startsAt: 1 })
            .limit(6)
            .lean(),
    ]);

    const items = [
        ...users.map((item: any) => ({
            id: item._id.toString(),
            type: 'user',
            title: item.name,
            subtitle: `${item.email} • ${item.role}`,
            href: '/app/admin/users',
        })),
        ...courses.map((item: any) => ({
            id: item._id.toString(),
            type: 'course',
            title: item.title,
            subtitle: `${item.category || 'Course'} • ${item.status || 'draft'}`,
            href: `/app/instructor/courses/${item._id}/edit`,
        })),
        ...tickets.map((item: any) => ({
            id: item._id.toString(),
            type: 'ticket',
            title: item.subject,
            subtitle: `${item.status} • ${item.priority}`,
            href: '/app/admin/tickets',
        })),
        ...announcements.map((item: any) => ({
            id: item._id.toString(),
            type: 'announcement',
            title: item.title,
            subtitle: `Announcement • ${new Date(item.createdAt).toLocaleDateString()}`,
            href: '/app/admin/announcements',
        })),
        ...events.map((item: any) => ({
            id: item._id.toString(),
            type: 'event',
            title: item.title,
            subtitle: `${item.isPublished ? 'Published' : 'Draft'} • ${new Date(item.startsAt).toLocaleString()}`,
            href: '/app/admin/events',
        })),
    ];

    sendSuccess(res, {
        query,
        items,
        counts: {
            users: users.length,
            courses: courses.length,
            tickets: tickets.length,
            announcements: announcements.length,
            events: events.length,
        },
    });
});

// @desc    Global instructor search
// @route   GET /api/dashboard/instructor/search
// @access  Private/Instructor
export const getInstructorGlobalSearch = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only instructors can search instructor data');
    }

    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const projectVisibility = req.query.projectVisibility === 'published'
        ? 'published'
        : req.query.projectVisibility === 'draft'
            ? 'draft'
            : 'all';

    if (query.length < 2) {
        sendSuccess(res, {
            query,
            projectVisibility,
            items: [],
            counts: {
                courses: 0,
                students: 0,
                projects: 0,
                submissions: 0,
                discussions: 0,
            },
        });
        return;
    }

    const instructorId = req.user._id.toString();
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const instructorCourses = await Course.find({
        instructor: instructorId,
        isDeleted: false,
    }).select('_id title students').lean();

    const courseIds = instructorCourses.map((course: any) => course._id);
    if (courseIds.length === 0) {
        sendSuccess(res, {
            query,
            projectVisibility,
            items: [],
            counts: {
                courses: 0,
                students: 0,
                projects: 0,
                submissions: 0,
                discussions: 0,
            },
        });
        return;
    }

    const studentIdSet = new Set<string>();
    instructorCourses.forEach((course: any) => {
        const students = Array.isArray(course.students) ? course.students : [];
        students.forEach((studentId: any) => {
            studentIdSet.add(studentId.toString());
        });
    });

    const studentIds = Array.from(studentIdSet);

    const [courses, students, projects, submissionsRaw, discussions] = await Promise.all([
        Course.find({
            instructor: instructorId,
            isDeleted: false,
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } },
            ],
        })
            .select('_id title category status')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        User.find({
            _id: { $in: studentIds },
            isDeleted: false,
            $or: [
                { name: { $regex: regex } },
                { email: { $regex: regex } },
            ],
        })
            .select('_id name email')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        Project.find({
            course: { $in: courseIds },
            isDeleted: false,
            ...(projectVisibility === 'published' ? { isPublished: true } : {}),
            ...(projectVisibility === 'draft' ? { isPublished: false } : {}),
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } },
                { instructions: { $regex: regex } },
            ],
        })
            .select('_id title isPublished deadline course')
            .populate('course', 'title')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        ProjectSubmission.find({
            course: { $in: courseIds },
        })
            .populate('student', 'name email')
            .populate('project', 'title')
            .sort({ updatedAt: -1 })
            .limit(40)
            .lean(),
        CommunityPost.find({
            course: { $in: courseIds },
            isDeleted: false,
            category: { $ne: 'announcement' },
            $or: [
                { title: { $regex: regex } },
                { content: { $regex: regex } },
                { tags: { $elemMatch: { $regex: regex } } },
            ],
        })
            .populate('course', 'title')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
    ]);

    const lowerQuery = query.toLowerCase();
    const submissions = submissionsRaw
        .filter((row: any) => {
            const haystack = [
                row.student?.name,
                row.student?.email,
                row.project?.title,
                row.comments,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(lowerQuery);
        })
        .slice(0, 6);

    const items = [
        ...courses.map((item: any) => ({
            id: item._id.toString(),
            type: 'course',
            title: item.title,
            subtitle: `${item.category || 'Course'} • ${item.status || 'draft'}`,
            href: `/app/courses/${item._id}`,
        })),
        ...students.map((item: any) => ({
            id: item._id.toString(),
            type: 'student',
            title: item.name,
            subtitle: item.email,
            href: '/app/instructor/students',
        })),
        ...projects.map((item: any) => ({
            id: item._id.toString(),
            type: 'project',
            title: item.title,
            subtitle: `${item.isPublished ? 'Published' : 'Draft'} • ${(item.course as any)?.title || 'Course Project'}`,
            href: '/app/instructor/projects',
        })),
        ...submissions.map((item: any) => ({
            id: item._id.toString(),
            type: 'submission',
            title: `${item.student?.name || 'Student'} • ${item.project?.title || 'Project'}`,
            subtitle: `Submission • ${new Date(item.updatedAt).toLocaleString()}`,
            href: '/app/instructor/projects',
        })),
        ...discussions.map((item: any) => ({
            id: item._id.toString(),
            type: 'discussion',
            title: item.title,
            subtitle: `${(item.course as any)?.title || 'Course Discussion'} • ${new Date(item.createdAt).toLocaleDateString()}`,
            href: '/app/instructor/comments',
        })),
    ];

    sendSuccess(res, {
        query,
        projectVisibility,
        items,
        counts: {
            courses: courses.length,
            students: students.length,
            projects: projects.length,
            submissions: submissions.length,
            discussions: discussions.length,
        },
    });
});

// @desc    Global student search
// @route   GET /api/dashboard/student/search
// @access  Private/Student
export const getStudentGlobalSearch = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.user.role !== 'student') {
        res.status(403);
        throw new Error('Only students can search learner data');
    }

    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length < 2) {
        sendSuccess(res, {
            query,
            items: [],
            counts: {
                courses: 0,
                projects: 0,
                resources: 0,
                discussions: 0,
            },
        });
        return;
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const currentUser = await User.findById(req.user._id).select('enrolledCourses').lean();
    const enrolledCourseIds = Array.isArray((currentUser as any)?.enrolledCourses)
        ? (currentUser as any).enrolledCourses.map((id: any) => id.toString())
        : [];

    const [courses, projectsRaw, lessonsRaw, discussions] = await Promise.all([
        Course.find({
            isDeleted: false,
            status: 'published',
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } },
                { category: { $regex: regex } },
            ],
        })
            .select('_id title category instructor students')
            .populate('instructor', 'name')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        enrolledCourseIds.length > 0
            ? Project.find({
                course: { $in: enrolledCourseIds },
                isDeleted: false,
                isPublished: true,
                $or: [
                    { title: { $regex: regex } },
                    { description: { $regex: regex } },
                    { instructions: { $regex: regex } },
                ],
            })
                .select('_id title course deadline')
                .populate('course', 'title')
                .sort({ createdAt: -1 })
                .limit(6)
                .lean()
            : Promise.resolve([] as any[]),
        enrolledCourseIds.length > 0
            ? Lesson.find({
                course: { $in: enrolledCourseIds },
                isDeleted: false,
                isPublished: true,
                $or: [
                    { title: { $regex: regex } },
                    { content: { $regex: regex } },
                ],
            })
                .select('_id title course attachments updatedAt')
                .populate('course', 'title')
                .sort({ updatedAt: -1 })
                .limit(20)
                .lean()
            : Promise.resolve([] as any[]),
        CommunityPost.find({
            isDeleted: false,
            category: { $ne: 'announcement' },
            $or: [
                { title: { $regex: regex } },
                { content: { $regex: regex } },
                { tags: { $elemMatch: { $regex: regex } } },
            ],
        })
            .select('_id title course createdAt')
            .populate('course', 'title')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
    ]);

    const studentId = req.user._id.toString();

    const courseItems = courses.map((item: any) => {
        const studentList = Array.isArray(item.students) ? item.students : [];
        const isEnrolled = studentList.some((id: any) => id.toString() === studentId);

        return {
            id: item._id.toString(),
            type: 'course',
            title: item.title,
            subtitle: `${item.category || 'Course'} • ${item.instructor?.name || 'Instructor'}${isEnrolled ? ' • Enrolled' : ''}`,
            href: `/app/courses/${item._id}`,
        };
    });

    const projectItems = projectsRaw.map((item: any) => ({
        id: item._id.toString(),
        type: 'project',
        title: item.title,
        subtitle: `${item.course?.title || 'Course'}${item.deadline ? ` • Due ${new Date(item.deadline).toLocaleDateString()}` : ''}`,
        href: '/app/projects',
    }));

    const resourceItems = lessonsRaw
        .flatMap((lesson: any) => {
            const attachments = Array.isArray(lesson.attachments) ? lesson.attachments : [];

            return attachments
                .filter((attachment: any) => {
                    const url = String(attachment?.url || '');
                    if (!url) {
                        return false;
                    }

                    const fileType = String(attachment?.fileType || '').toLowerCase();
                    const isVideoAttachment = fileType.includes('video') || /\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(url);
                    if (isVideoAttachment) {
                        return false;
                    }

                    const attachmentTitle = String(attachment?.title || '');
                    return regex.test(attachmentTitle) || regex.test(url) || regex.test(String(lesson.title || ''));
                })
                .map((attachment: any, index: number) => ({
                    id: `${lesson._id.toString()}-${index}`,
                    type: 'resource',
                    title: attachment.title || lesson.title,
                    subtitle: `${lesson.course?.title || 'Course'} • ${attachment.fileType || 'file'}`,
                    href: '/app/resources',
                }));
        })
        .slice(0, 6);

    const discussionItems = discussions.map((item: any) => ({
        id: item._id.toString(),
        type: 'discussion',
        title: item.title,
        subtitle: `${item.course?.title || 'Community'} • ${new Date(item.createdAt).toLocaleDateString()}`,
        href: '/app/community',
    }));

    const items = [
        ...courseItems,
        ...projectItems,
        ...resourceItems,
        ...discussionItems,
    ].slice(0, 16);

    sendSuccess(res, {
        query,
        items,
        counts: {
            courses: courseItems.length,
            projects: projectItems.length,
            resources: resourceItems.length,
            discussions: discussionItems.length,
        },
    });
});
