"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const courseValidator_1 = require("../validators/courseValidator");
const courseController_1 = require("../controllers/courseController");
const lessonRoutes_1 = __importDefault(require("./lessonRoutes"));
const router = express_1.default.Router();
// Get all courses & Create a course (Instructors/Admins)
router.route('/')
    .get(authMiddleware_1.optionalProtect, courseController_1.getCourses)
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), (0, validateMiddleware_1.validateRequest)(courseValidator_1.createCourseSchema), courseController_1.createCourse);
// ID operations: Get singular, Update, Delete
router.route('/:id')
    .get(courseController_1.getCourseById)
    .put(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), (0, validateMiddleware_1.validateRequest)(courseValidator_1.updateCourseSchema), courseController_1.updateCourse)
    .delete(authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), courseController_1.deleteCourse);
// Enroll in a course (Students mostly, but maybe others too)
router.post('/:id/enroll', authMiddleware_1.protect, courseController_1.enrollCourse);
// Sub-routing for lessons: Any request to /api/courses/:courseId/lessons will be handed to lessonRoutes
router.use('/:courseId/lessons', lessonRoutes_1.default);
exports.default = router;
//# sourceMappingURL=courseRoutes.js.map