"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const supportController_1 = require("../controllers/supportController");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, supportController_1.submitTicket);
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), supportController_1.getTickets);
router.put('/:id/reply', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), supportController_1.replyTicket);
exports.default = router;
//# sourceMappingURL=supportRoutes.js.map