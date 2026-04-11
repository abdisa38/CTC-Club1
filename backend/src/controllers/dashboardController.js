"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstructorGlobalSearch = exports.getAdminGlobalSearch = exports.getInstructorAnalytics = exports.getInstructorStudents = exports.getPublicStats = exports.getDashboardAnnouncements = exports.getDashboardResources = exports.getLeaderboard = exports.getAdminAnalytics = exports.getDashboardMetrics = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const progressModel_1 = __importDefault(require("../models/progressModel"));
const ticketModel_1 = __importDefault(require("../models/ticketModel"));
const lessonModel_1 = __importDefault(require("../models/lessonModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const projectModel_1 = require("../models/projectModel");
const quizModel_1 = require("../models/quizModel");
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const communityModel_1 = require("../models/communityModel");
const apiResponse_1 = require("../utils/apiResponse");
const toIsoDayKey = (date) => date.toISOString().split('T')[0];
const buildLastSevenDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        days.push(d);
    }
    return days;
};
const toMonthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
const toValidDate = (value) => {
    if (!value) {
        return null;
    }
    const candidate = new Date(value);
    if (Number.isNaN(candidate.getTime())) {
        return null;
    }
    return candidate;
};
const monthDiffInclusive = (start, end) => {
    const years = end.getUTCFullYear() - start.getUTCFullYear();
    const months = end.getUTCMonth() - start.getUTCMonth();
    return (years * 12) + months + 1;
};
const buildMonthlyTimeline = (totalMonths) => {
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
        userModel_1.default.countDocuments({ isDeleted: false }),
        courseModel_1.default.countDocuments({ isDeleted: false }),
        ticketModel_1.default.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
        userModel_1.default.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(10).select('-password'),
    ]);
    const estimatedRevenueAgg = await courseModel_1.default.aggregate([
        { $match: { isDeleted: false, status: 'published' } },
        {
            $project: {
                revenue: { $multiply: ['$price', { $size: '$students' }] },
            },
        },
        { $group: { _id: null, total: { $sum: '$revenue' } } },
    ]);
    const lastSevenDays = buildLastSevenDays();
    const progressActivity = await progressModel_1.default.aggregate([
        { $match: { updatedAt: { $gte: lastSevenDays[0] } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                count: { $sum: 1 },
            },
        },
    ]);
    const activityMap = new Map(progressActivity.map((item) => [item._id, item.count]));
    const userActivityData = lastSevenDays.map((day) => ({
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        active: activityMap.get(toIsoDayKey(day)) || 0,
    }));
    const courseCompletionData = await progressModel_1.default.aggregate([
        { $match: { isCompleted: true } },
        { $group: { _id: '$course', completed: { $sum: 1 } } },
        { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        { $project: { _id: 0, name: '$course.title', completed: 1 } },
        { $sort: { completed: -1 } },
        { $limit: 8 },
    ]);
    const ticketStatusRaw = await ticketModel_1.default.aggregate([
        { $group: { _id: '$status', value: { $sum: 1 } } },
    ]);
    const ticketStatusData = [
        { name: 'Open', key: 'open' },
        { name: 'In Progress', key: 'in_progress' },
        { name: 'Resolved', key: 'resolved' },
        { name: 'Closed', key: 'closed' },
    ].map((s) => ({
        name: s.name,
        value: ticketStatusRaw.find((row) => row._id === s.key)?.value || 0,
    }));
    const [recentCourses, recentTickets] = await Promise.all([
        courseModel_1.default.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(8).populate('instructor', 'name'),
        ticketModel_1.default.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(8).populate('user', 'name'),
    ]);
    const activityLogs = [
        ...recentUsers.map((u) => ({
            id: `user-${u._id}`,
            action: 'New user registered',
            user: u.name,
            time: u.createdAt,
            type: 'user',
        })),
        ...recentCourses.map((c) => ({
            id: `course-${c._id}`,
            action: 'Course created',
            user: c.instructor?.name || 'Instructor',
            time: c.createdAt,
            type: 'course',
        })),
        ...recentTickets.map((t) => ({
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
exports.getDashboardMetrics = (0, express_async_handler_1.default)(async (req, res) => {
    const role = req.user.role;
    if (role === 'admin') {
        const metrics = await buildAdminMetrics();
        (0, apiResponse_1.sendSuccess)(res, metrics);
        return;
    }
    if (role === 'instructor') {
        const totalCourses = await courseModel_1.default.countDocuments({ instructor: req.user._id, isDeleted: false });
        // Sum total students across all instructor courses
        const instructorCourses = await courseModel_1.default.find({ instructor: req.user._id, isDeleted: false }).select('students price title');
        let totalStudents = 0;
        let totalRevenue = 0;
        for (let c of instructorCourses) {
            totalStudents += c.students.length;
            totalRevenue += (c.students.length * c.price);
        }
        // Submissions waiting to be graded
        const pendingSubmissions = await projectModel_1.ProjectSubmission.countDocuments({
            course: { $in: instructorCourses.map(c => c._id) },
            status: { $in: ['submitted', 'under_review'] }
        });
        const latestSubmissions = await projectModel_1.ProjectSubmission.find({
            course: { $in: instructorCourses.map(c => c._id) },
        })
            .populate('student', 'name avatar')
            .populate('project', 'title')
            .sort({ updatedAt: -1 })
            .limit(8);
        (0, apiResponse_1.sendSuccess)(res, {
            totalCourses,
            totalStudents,
            totalRevenue,
            pendingSubmissions,
            latestSubmissions,
            coursePerformance: instructorCourses.map((course) => ({
                name: course.title,
                students: course.students.length,
                revenue: course.students.length * course.price,
            })),
        });
        return;
    }
    // Role is Student
    const userProgress = await progressModel_1.default.find({ user: req.user._id }).populate({
        path: 'course',
        select: 'title coverImage totalDuration'
    });
    const enrolledCourses = userProgress.length;
    const completedCourses = userProgress.filter(p => p.isCompleted).length;
    // Next lesson logic: find progress where percentage < 100
    const activeProgress = userProgress.filter(p => !p.isCompleted);
    const [notifications, quizResults, projectSubmissions] = await Promise.all([
        notificationModel_1.default.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10),
        quizModel_1.QuizResult.find({ user: req.user._id }).populate('quiz', 'title').sort({ createdAt: -1 }).limit(10),
        projectModel_1.ProjectSubmission.find({ student: req.user._id })
            .populate('project', 'title')
            .populate('course', 'title')
            .sort({ updatedAt: -1 })
            .limit(10),
    ]);
    (0, apiResponse_1.sendSuccess)(res, {
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
exports.getAdminAnalytics = (0, express_async_handler_1.default)(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admins can access analytics');
    }
    const analytics = await buildAdminMetrics();
    (0, apiResponse_1.sendSuccess)(res, analytics);
});
// @desc    Get leaderboard
// @route   GET /api/dashboard/leaderboard
// @access  Private
exports.getLeaderboard = (0, express_async_handler_1.default)(async (req, res) => {
    const users = await userModel_1.default.find({ isDeleted: false })
        .sort({ xp: -1, createdAt: 1 })
        .limit(100)
        .select('name avatar xp level role');
    const leaderboard = users.map((u, index) => ({
        rank: index + 1,
        id: u._id,
        name: u.name,
        avatar: u.avatar,
        xp: u.xp || 0,
        level: u.level || 1,
        role: u.role,
    }));
    (0, apiResponse_1.sendSuccess)(res, leaderboard);
});
// @desc    Get dashboard resources from lessons/attachments
// @route   GET /api/dashboard/resources
// @access  Private
exports.getDashboardResources = (0, express_async_handler_1.default)(async (req, res) => {
    const filter = { isDeleted: false };
    if (req.user.role === 'student') {
        filter.isPublished = true;
    }
    const lessons = await lessonModel_1.default.find(filter)
        .populate('course', 'title category')
        .sort({ updatedAt: -1 })
        .limit(150);
    const resources = lessons.flatMap((lesson) => {
        const courseTitle = lesson.course?.title || 'General';
        const courseCategory = lesson.course?.category || 'General';
        const items = [];
        if (Array.isArray(lesson.attachments)) {
            lesson.attachments.forEach((attachment, index) => {
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
    (0, apiResponse_1.sendSuccess)(res, resources);
});
// @desc    Get announcements for homepage
// @route   GET /api/dashboard/announcements
// @access  Public
exports.getDashboardAnnouncements = (0, express_async_handler_1.default)(async (req, res) => {
    const posts = await communityModel_1.CommunityPost.find({ category: 'announcement', isDeleted: false })
        .populate('user', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(6);
    if (posts.length > 0) {
        const announcements = posts.map((post) => ({
            id: post._id,
            title: post.title,
            content: post.content,
            author: post.user?.name || 'CTC Team',
            createdAt: post.createdAt,
            category: post.category,
        }));
        (0, apiResponse_1.sendSuccess)(res, announcements);
        return;
    }
    const fallbackFromCourses = await courseModel_1.default.find({ isDeleted: false, status: 'published' })
        .populate('instructor', 'name')
        .sort({ createdAt: -1 })
        .limit(5);
    const announcements = fallbackFromCourses.map((course) => ({
        id: course._id,
        title: `New Course: ${course.title}`,
        content: course.shortDescription || course.description,
        author: course.instructor?.name || 'CTC Team',
        createdAt: course.createdAt,
        category: 'announcement',
    }));
    (0, apiResponse_1.sendSuccess)(res, announcements);
});
// @desc    Get public stats for the homepage
// @route   GET /api/dashboard/public-stats
// @access  Public
exports.getPublicStats = (0, express_async_handler_1.default)(async (req, res) => {
    const totalUsers = await userModel_1.default.countDocuments({ role: 'student', isDeleted: false });
    const totalCourses = await courseModel_1.default.countDocuments({ isDeleted: false, status: 'published' });
    const expertInstructors = await userModel_1.default.countDocuments({ role: 'instructor', isDeleted: false });
    // As a fun proxy for "certificates issued", we can use total completed courses across all students
    const totalCompleted = await progressModel_1.default.countDocuments({ isCompleted: true });
    (0, apiResponse_1.sendSuccess)(res, {
        activeStudents: totalUsers,
        videoCourses: totalCourses,
        instructors: expertInstructors,
        certificates: totalCompleted,
    });
});
// @desc    Get instructor students with aggregate stats
// @route   GET /api/dashboard/instructor/students
// @access  Private/Instructor/Admin
exports.getInstructorStudents = (0, express_async_handler_1.default)(async (req, res) => {
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
    const courseFilter = { isDeleted: false };
    if (role === 'instructor' || instructorId) {
        courseFilter.instructor = instructorId;
    }
    if (courseId) {
        courseFilter._id = courseId;
    }
    const instructorCourses = await courseModel_1.default.find(courseFilter)
        .select('_id title students instructor')
        .lean();
    const courseSummaries = instructorCourses.map((course) => ({
        _id: course._id.toString(),
        title: course.title,
    }));
    const uniqueStudentIds = new Set();
    instructorCourses.forEach((course) => {
        const students = Array.isArray(course.students) ? course.students : [];
        students.forEach((studentId) => {
            uniqueStudentIds.add(studentId.toString());
        });
    });
    const studentIds = Array.from(uniqueStudentIds);
    if (studentIds.length === 0) {
        (0, apiResponse_1.sendSuccess)(res, {
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
        userModel_1.default.find({ _id: { $in: studentIds }, isDeleted: false })
            .select('name email avatar isActive lastLogin createdAt updatedAt')
            .lean(),
        progressModel_1.default.find({
            user: { $in: studentIds },
            course: { $in: instructorCourses.map((c) => c._id) },
        })
            .select('user course progressPercentage isCompleted updatedAt')
            .lean(),
    ]);
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const studentRecords = students
        .map((student) => {
        const studentId = student._id.toString();
        const enrolledCourses = instructorCourses
            .filter((course) => (Array.isArray(course.students) ? course.students : []).some((id) => id.toString() === studentId))
            .map((course) => ({ _id: course._id.toString(), title: course.title }));
        const studentProgress = progresses.filter((progress) => progress.user.toString() === studentId);
        const avgProgress = studentProgress.length > 0
            ? Math.round(studentProgress.reduce((sum, item) => sum + (item.progressPercentage || 0), 0) / studentProgress.length)
            : 0;
        const allCompleted = studentProgress.length > 0 && studentProgress.every((progress) => progress.isCompleted);
        const candidateTimestamps = [
            ...(studentProgress.map((progress) => new Date(progress.updatedAt).getTime()).filter((value) => Number.isFinite(value))),
            student.lastLogin ? new Date(student.lastLogin).getTime() : 0,
            student.updatedAt ? new Date(student.updatedAt).getTime() : 0,
            student.createdAt ? new Date(student.createdAt).getTime() : 0,
        ].filter((value) => value > 0);
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
        .filter((student) => {
        if (!keyword)
            return true;
        return (student.name.toLowerCase().includes(keyword)
            || student.email.toLowerCase().includes(keyword)
            || student.courses.some((course) => course.title.toLowerCase().includes(keyword)));
    });
    const avgCompletionRate = studentRecords.length > 0
        ? Math.round(studentRecords.reduce((sum, student) => sum + (student.progress || 0), 0) / studentRecords.length)
        : 0;
    const activeThisWeek = studentRecords.filter((student) => {
        if (!student.lastActiveAt)
            return false;
        const ts = new Date(student.lastActiveAt).getTime();
        return Number.isFinite(ts) && (now - ts) <= oneWeekMs;
    }).length;
    (0, apiResponse_1.sendSuccess)(res, {
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
exports.getInstructorAnalytics = (0, express_async_handler_1.default)(async (req, res) => {
    const role = req.user.role;
    if (role !== 'instructor' && role !== 'admin') {
        res.status(403);
        throw new Error('Only instructors and admins can access instructor analytics');
    }
    const instructorId = role === 'admin' && typeof req.query.instructorId === 'string'
        ? req.query.instructorId
        : req.user._id.toString();
    const instructorCourses = await courseModel_1.default.find({
        instructor: instructorId,
        isDeleted: false,
    })
        .select('_id title students price rating numReviews createdAt')
        .lean();
    const courseIds = instructorCourses.map((course) => course._id);
    const progresses = courseIds.length > 0
        ? await progressModel_1.default.find({ course: { $in: courseIds } })
            .select('course progressPercentage isCompleted createdAt completionDate updatedAt')
            .lean()
        : [];
    const coursePriceMap = new Map();
    const progressByCourse = new Map();
    instructorCourses.forEach((course) => {
        const courseId = course._id.toString();
        coursePriceMap.set(courseId, Number(course.price) || 0);
        progressByCourse.set(courseId, []);
    });
    progresses.forEach((entry) => {
        const courseId = entry.course.toString();
        const current = progressByCourse.get(courseId) || [];
        current.push(entry);
        progressByCourse.set(courseId, current);
    });
    const totalEnrollments = instructorCourses.reduce((sum, course) => {
        const enrolled = Array.isArray(course.students) ? course.students.length : 0;
        return sum + enrolled;
    }, 0);
    const totalRevenue = instructorCourses.reduce((sum, course) => {
        const enrolled = Array.isArray(course.students) ? course.students.length : 0;
        const price = Number(course.price) || 0;
        return sum + (enrolled * price);
    }, 0);
    const totalReviews = instructorCourses.reduce((sum, course) => sum + (Number(course.numReviews) || 0), 0);
    const weightedRatingSum = instructorCourses.reduce((sum, course) => sum + ((Number(course.rating) || 0) * (Number(course.numReviews) || 0)), 0);
    const avgCourseRating = totalReviews > 0 ? Number((weightedRatingSum / totalReviews).toFixed(2)) : 0;
    const completedCount = progresses.filter((entry) => entry.isCompleted).length;
    const inProgressCount = progresses.filter((entry) => !entry.isCompleted && (entry.progressPercentage || 0) > 0).length;
    const notStartedCount = progresses.filter((entry) => !entry.isCompleted && (entry.progressPercentage || 0) <= 0).length;
    const sortedProgressDates = progresses
        .map((entry) => toValidDate(entry.createdAt))
        .filter((date) => date !== null)
        .sort((a, b) => a.getTime() - b.getTime());
    const now = new Date();
    const earliestDate = sortedProgressDates[0]
        ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const firstMonth = new Date(Date.UTC(earliestDate.getUTCFullYear(), earliestDate.getUTCMonth(), 1));
    const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const totalMonths = monthDiffInclusive(firstMonth, currentMonth);
    const trendTimeline = buildMonthlyTimeline(totalMonths);
    const trendMap = new Map(trendTimeline.map((month) => [
        month.key,
        {
            month: month.label,
            date: month.date,
            revenue: 0,
            enrollments: 0,
            completions: 0,
        },
    ]));
    progresses.forEach((entry) => {
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
    const trends = trendTimeline.map((month) => (trendMap.get(month.key) || {
        month: month.label,
        date: month.date,
        revenue: 0,
        enrollments: 0,
        completions: 0,
    }));
    const coursePerformance = instructorCourses
        .map((course) => {
        const courseId = course._id.toString();
        const courseProgresses = progressByCourse.get(courseId) || [];
        const enrollments = Array.isArray(course.students) ? course.students.length : 0;
        const completions = courseProgresses.filter((entry) => entry.isCompleted).length;
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
    (0, apiResponse_1.sendSuccess)(res, {
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
exports.getAdminGlobalSearch = (0, express_async_handler_1.default)(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admins can search platform data');
    }
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length < 2) {
        (0, apiResponse_1.sendSuccess)(res, {
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
        userModel_1.default.find({
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
        courseModel_1.default.find({
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
        ticketModel_1.default.find({
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
        communityModel_1.CommunityPost.find({
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
        eventModel_1.default.find({
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
        ...users.map((item) => ({
            id: item._id.toString(),
            type: 'user',
            title: item.name,
            subtitle: `${item.email} • ${item.role}`,
            href: '/app/admin/users',
        })),
        ...courses.map((item) => ({
            id: item._id.toString(),
            type: 'course',
            title: item.title,
            subtitle: `${item.category || 'Course'} • ${item.status || 'draft'}`,
            href: `/app/instructor/courses/${item._id}/edit`,
        })),
        ...tickets.map((item) => ({
            id: item._id.toString(),
            type: 'ticket',
            title: item.subject,
            subtitle: `${item.status} • ${item.priority}`,
            href: '/app/admin/tickets',
        })),
        ...announcements.map((item) => ({
            id: item._id.toString(),
            type: 'announcement',
            title: item.title,
            subtitle: `Announcement • ${new Date(item.createdAt).toLocaleDateString()}`,
            href: '/app/admin/announcements',
        })),
        ...events.map((item) => ({
            id: item._id.toString(),
            type: 'event',
            title: item.title,
            subtitle: `${item.isPublished ? 'Published' : 'Draft'} • ${new Date(item.startsAt).toLocaleString()}`,
            href: '/app/admin/events',
        })),
    ];
    (0, apiResponse_1.sendSuccess)(res, {
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
exports.getInstructorGlobalSearch = (0, express_async_handler_1.default)(async (req, res) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only instructors can search instructor data');
    }
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length < 2) {
        (0, apiResponse_1.sendSuccess)(res, {
            query,
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
    const instructorCourses = await courseModel_1.default.find({
        instructor: instructorId,
        isDeleted: false,
    }).select('_id title students').lean();
    const courseIds = instructorCourses.map((course) => course._id);
    if (courseIds.length === 0) {
        (0, apiResponse_1.sendSuccess)(res, {
            query,
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
    const studentIdSet = new Set();
    instructorCourses.forEach((course) => {
        const students = Array.isArray(course.students) ? course.students : [];
        students.forEach((studentId) => {
            studentIdSet.add(studentId.toString());
        });
    });
    const studentIds = Array.from(studentIdSet);
    const [courses, students, projects, submissionsRaw, discussions] = await Promise.all([
        courseModel_1.default.find({
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
        userModel_1.default.find({
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
        projectModel_1.Project.find({
            course: { $in: courseIds },
            isDeleted: false,
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
        projectModel_1.ProjectSubmission.find({
            course: { $in: courseIds },
        })
            .populate('student', 'name email')
            .populate('project', 'title')
            .sort({ updatedAt: -1 })
            .limit(40)
            .lean(),
        communityModel_1.CommunityPost.find({
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
        .filter((row) => {
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
        ...courses.map((item) => ({
            id: item._id.toString(),
            type: 'course',
            title: item.title,
            subtitle: `${item.category || 'Course'} • ${item.status || 'draft'}`,
            href: `/app/courses/${item._id}`,
        })),
        ...students.map((item) => ({
            id: item._id.toString(),
            type: 'student',
            title: item.name,
            subtitle: item.email,
            href: '/app/instructor/students',
        })),
        ...projects.map((item) => ({
            id: item._id.toString(),
            type: 'project',
            title: item.title,
            subtitle: `${item.isPublished ? 'Published' : 'Draft'} • ${item.course?.title || 'Course Project'}`,
            href: '/app/instructor/projects',
        })),
        ...submissions.map((item) => ({
            id: item._id.toString(),
            type: 'submission',
            title: `${item.student?.name || 'Student'} • ${item.project?.title || 'Project'}`,
            subtitle: `Submission • ${new Date(item.updatedAt).toLocaleString()}`,
            href: '/app/instructor/projects',
        })),
        ...discussions.map((item) => ({
            id: item._id.toString(),
            type: 'discussion',
            title: item.title,
            subtitle: `${item.course?.title || 'Course Discussion'} • ${new Date(item.createdAt).toLocaleDateString()}`,
            href: '/app/instructor/comments',
        })),
    ];
    (0, apiResponse_1.sendSuccess)(res, {
        query,
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
//# sourceMappingURL=dashboardController.js.map