"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const projectController_1 = require("../controllers/projectController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.protect, projectController_1.getProjects);
router.get('/submissions', authMiddleware_1.protect, projectController_1.getProjectSubmissions);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), projectController_1.createProject);
router.post('/:id/submit', authMiddleware_1.protect, projectController_1.submitProject);
router.put('/submissions/:submissionId/review', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), projectController_1.reviewProject);
exports.default = router;
//# sourceMappingURL=projectRoutes.js.map