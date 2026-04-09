"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
exports.createCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title is required and must be at least 3 characters'),
        description: zod_1.z.string().min(10, 'Description is required and must be at least 10 characters'),
        category: zod_1.z.string().min(2, 'Category is required'),
        coverImage: zod_1.z.string().url('Must be a valid URL').optional().or(zod_1.z.literal('')),
        price: zod_1.z.number().min(0, 'Price must be a positive number').optional().default(0),
    }),
});
exports.updateCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(10).optional(),
        category: zod_1.z.string().min(2).optional(),
        coverImage: zod_1.z.string().url('Must be a valid URL').optional().or(zod_1.z.literal('')),
        price: zod_1.z.number().min(0).optional(),
    }),
});
//# sourceMappingURL=courseValidator.js.map