"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const dashboardController_1 = require("../controllers/dashboardController");
const router = express_1.default.Router();
router.get('/public-stats', dashboardController_1.getPublicStats);
router.get('/announcements', dashboardController_1.getDashboardAnnouncements);
router.get('/metrics', authMiddleware_1.protect, dashboardController_1.getDashboardMetrics);
router.get('/analytics', authMiddleware_1.protect, dashboardController_1.getAdminAnalytics);
router.get('/leaderboard', authMiddleware_1.protect, dashboardController_1.getLeaderboard);
router.get('/resources', authMiddleware_1.protect, dashboardController_1.getDashboardResources);
router.get('/instructor/students', authMiddleware_1.protect, dashboardController_1.getInstructorStudents);
router.get('/instructor/analytics', authMiddleware_1.protect, dashboardController_1.getInstructorAnalytics);
router.get('/instructor/search', authMiddleware_1.protect, dashboardController_1.getInstructorGlobalSearch);
router.get('/admin/search', authMiddleware_1.protect, dashboardController_1.getAdminGlobalSearch);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map