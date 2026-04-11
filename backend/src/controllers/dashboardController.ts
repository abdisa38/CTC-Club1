import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/userModel';
import Course from '../models/courseModel';
import Progress from '../models/progressModel';
import Ticket from '../models/ticketModel';
import Lesson from '../models/lessonModel';
import { ProjectSubmission } from '../models/projectModel';
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
        const instructorCourses = await Course.find({ instructor: req.user._id, isDeleted: false }).select('students price title');
        let totalStudents = 0;
        let totalRevenue = 0; 
        
        for(let c of instructorCourses) {
            totalStudents += c.students.length;
            totalRevenue += (c.students.length * c.price);
        }

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
            pendingSubmissions,
            latestSubmissions,
            coursePerformance: instructorCourses.map((course: any) => ({
                name: course.title,
                students: course.students.length,
                revenue: course.students.length * course.price,
            })),
        });
        return;
    }

    // Role is Student
    const userProgress = await Progress.find({ user: req.user._id }).populate({
        path: 'course',
        select: 'title coverImage totalDuration'
    });

    const enrolledCourses = userProgress.length;
    const completedCourses = userProgress.filter(p => p.isCompleted).length;

    // Next lesson logic: find progress where percentage < 100
    const activeProgress = userProgress.filter(p => !p.isCompleted);

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
        xp: req.user.xp,
        level: req.user.level,
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
    const users = await User.find({ isDeleted: false })
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
        .populate('course', 'title')
        .sort({ updatedAt: -1 })
        .limit(150);

    const resources = lessons.flatMap((lesson: any) => {
        const courseTitle = lesson.course?.title || 'General';
        const items: any[] = [];

        if (lesson.videoUrl) {
            items.push({
                id: `video-${lesson._id}`,
                title: lesson.title,
                type: 'video',
                size: '-',
                course: courseTitle,
                url: lesson.videoUrl,
                date: lesson.updatedAt,
            });
        }

        if (Array.isArray(lesson.attachments)) {
            lesson.attachments.forEach((attachment: any, index: number) => {
                items.push({
                    id: `attachment-${lesson._id}-${index}`,
                    title: attachment.title || `${lesson.title} Resource`,
                    type: attachment.fileType || 'file',
                    size: '-',
                    course: courseTitle,
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
