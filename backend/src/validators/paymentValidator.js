"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCoursePaymentSchema = exports.initializeCoursePaymentSchema = exports.verifyPremiumPaymentSchema = void 0;
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
exports.initializeCoursePaymentSchema = zod_1.z.object({
    params: zod_1.z.object({
        courseId: zod_1.z
            .string()
            .trim()
            .length(24, 'Invalid course id')
            .regex(/^[a-fA-F0-9]+$/, 'Invalid course id format'),
    }),
});
exports.verifyCoursePaymentSchema = zod_1.z.object({
    params: zod_1.z.object({
        courseId: zod_1.z
            .string()
            .trim()
            .length(24, 'Invalid course id')
            .regex(/^[a-fA-F0-9]+$/, 'Invalid course id format'),
        txRef: zod_1.z
            .string()
            .trim()
            .min(6, 'Transaction reference is required')
            .max(120, 'Transaction reference is too long')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid transaction reference format'),
    }),
});
//# sourceMappingURL=paymentValidator.js.map