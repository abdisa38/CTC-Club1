"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const authValidator_1 = require("../validators/authValidator");
const router = express_1.default.Router();
router.post('/register', (0, validateMiddleware_1.validateRequest)(authValidator_1.registerSchema), authController_1.registerUser);
router.post('/login', (0, validateMiddleware_1.validateRequest)(authValidator_1.loginSchema), authController_1.loginUser);
router.post('/logout', authController_1.logoutUser);
router.get('/profile', authMiddleware_1.protect, authController_1.getUserProfile);
router.get('/favorites/courses', authMiddleware_1.protect, authController_1.getFavoriteCourses);
router.post('/favorites/courses/:courseId', authMiddleware_1.protect, authController_1.addFavoriteCourse);
router.delete('/favorites/courses/:courseId', authMiddleware_1.protect, authController_1.removeFavoriteCourse);
router.get('/users', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), authController_1.getUsers);
router.put('/users/:id/role', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), authController_1.updateUserRole);
router.put('/users/:id/status', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), authController_1.updateUserStatus);
router.delete('/users/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), authController_1.softDeleteUser);
router.get('/activity-logs', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), authController_1.getActivityLogs);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map