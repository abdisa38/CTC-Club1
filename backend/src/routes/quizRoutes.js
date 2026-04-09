"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const quizController_1 = require("../controllers/quizController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.protect, quizController_1.getQuizzes);
router.get('/:id', authMiddleware_1.protect, quizController_1.getQuizById);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), quizController_1.createQuiz);
router.post('/:id/submit', authMiddleware_1.protect, quizController_1.submitQuiz);
// Make accessible to student so they can see their own past attempts, controller handles filtering
router.get('/:id/results', authMiddleware_1.protect, quizController_1.getQuizResults);
exports.default = router;
//# sourceMappingURL=quizRoutes.js.map