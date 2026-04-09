"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.protect, notificationController_1.getNotifications);
router.patch('/read-all', authMiddleware_1.protect, notificationController_1.markAllNotificationsRead);
router.patch('/:id/read', authMiddleware_1.protect, notificationController_1.markNotificationRead);
router.post('/broadcast', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), notificationController_1.broadcastNotification);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map