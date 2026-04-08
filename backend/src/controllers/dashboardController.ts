import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/userModel';
import Course from '../models/courseModel';
import Progress from '../models/progressModel';
import Ticket from '../models/ticketModel';
import { ProjectSubmission } from '../models/projectModel';

// @desc    Get dashboard metrics based on role
// @route   GET /api/dashboard/metrics
// @access  Private
export const getDashboardMetrics = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const role = req.user.role;

    if (role === 'admin') {
        const totalUsers = await User.countDocuments({ isDeleted: false });     
        const totalCourses = await Course.countDocuments({ isDeleted: false }); 
        const openTickets = await Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } });
        const totalRevenue = await Course.aggregate([
             { $match: { isDeleted: false } },
             { $group: { _id: null, total: { $sum: "$price" } } } // Assuming revenue = sum of all course prices (simplification without a payment/order model) 
        ]);

        res.json({
            totals: { users: totalUsers, courses: totalCourses },
            openTickets,
            totalRevenue: totalRevenue[0]?.total || 0,
        });
        return;
    } 
    
    if (role === 'instructor') {
        const totalCourses = await Course.countDocuments({ instructor: req.user._id, isDeleted: false });
        
        // Sum total students across all instructor courses
        const instructorCourses = await Course.find({ instructor: req.user._id, isDeleted: false }).select('students price');
        let totalStudents = 0;
        let totalRevenue = 0; 
        
        for(let c of instructorCourses) {
            totalStudents += c.students.length;
            totalRevenue += (c.students.length * c.price); // Dummy revenue calc
        }

        // Submissions waiting to be graded
        const pendingSubmissions = await ProjectSubmission.countDocuments({ 
            course: { $in: instructorCourses.map(c => c._id) },
            status: { $in: ['submitted', 'under_review'] }
        });

        res.json({
            totalCourses,
            totalStudents,
            totalRevenue,
            pendingSubmissions
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

    res.json({
        xp: req.user.xp,
        level: req.user.level,
        enrolledCourses,
        completedCourses,
        activeCourses: activeProgress
    });
});
