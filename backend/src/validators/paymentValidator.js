"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPremiumPaymentSchema = void 0;
const zod_1 = require("zod");
exports.verifyPremiumPaymentSchema = zod_1.z.object({
    params: zod_1.z.object({
        txRef: zod_1.z
            .string()
            .trim()
            .min(6, 'Transaction reference is required')
            .max(120, 'Transaction reference is too long')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid transaction reference format'),
    }),
});
//# sourceMappingURL=paymentValidator.js.map