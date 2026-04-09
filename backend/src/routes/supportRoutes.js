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
// Users can get their own tickets, admins get all
router.get('/', authMiddleware_1.protect, supportController_1.getTickets);
router.get('/:id', authMiddleware_1.protect, supportController_1.getTicketById);
// Users can reply too now, auth checks ownership in the controller
router.post('/:id/reply', authMiddleware_1.protect, supportController_1.replyTicket);
router.put('/:id/status', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin'), supportController_1.changeTicketStatus);
exports.default = router;
//# sourceMappingURL=supportRoutes.js.map