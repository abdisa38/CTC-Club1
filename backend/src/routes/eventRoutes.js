"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const eventController_1 = require("../controllers/eventController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.optionalProtect, eventController_1.getEvents);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), eventController_1.createEvent);
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), eventController_1.updateEvent);
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), eventController_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=eventRoutes.js.map