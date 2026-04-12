"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const paymentController_1 = require("../controllers/paymentController");
const paymentValidator_1 = require("../validators/paymentValidator");
const router = express_1.default.Router();
router.post('/premium/initialize', authMiddleware_1.protect, paymentController_1.initializePremiumPayment);
router.get('/premium/verify/:txRef', authMiddleware_1.protect, (0, validateMiddleware_1.validateRequest)(paymentValidator_1.verifyPremiumPaymentSchema), paymentController_1.verifyPremiumPayment);
router.get('/chapa/callback', paymentController_1.chapaCallback);
router.post('/chapa/webhook', paymentController_1.chapaWebhook);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map