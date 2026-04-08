"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const lessonController_1 = require("../controllers/lessonController");
// We add mergeParams so that we can access the :courseId if it's passed from the courseRouter
const router = express_1.default.Router({ mergeParams: true });
// The route might look like: /api/courses/:courseId/lessons
router.route('/')
    .get(authMiddleware_1.protect, lessonController_1.getLessonsByCourse) // Get lessons of a specific course id that is passed through params
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), lessonController_1.addLesson); // Instructor adds a lesson
// The route looks like: /api/courses/lessons/:lessonId (Mounted directly in server or courseRouter)
router.route('/:lessonId')
    .put(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), lessonController_1.updateLesson)
    .delete(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), lessonController_1.deleteLesson);
exports.default = router;
//# sourceMappingURL=lessonRoutes.js.map