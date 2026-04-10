"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const uploadController_1 = require("../controllers/uploadController");
const router = express_1.default.Router();
router.post('/video', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), uploadMiddleware_1.handleVideoUpload, uploadController_1.uploadLessonVideo);
router.post('/resource', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('instructor', 'admin'), uploadMiddleware_1.handleResourceUpload, uploadController_1.uploadLessonResource);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map