"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const courseSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        maxlength: [100, 'Course title cannot exceed 100 characters'],
    },
    slug: {
        type: String,
        unique: true,
        index: true,
        required: [true, 'Course slug is required'],
        lowercase: true,
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    instructor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    students: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    coverImage: {
        type: String,
        default: 'no-photo.jpg'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Development', 'Design', 'Marketing', 'Business', 'Other'], // Update enums here
        index: true,
    },
    tags: [
        {
            type: String,
        }
    ],
    price: {
        type: Number,
        required: [true, 'Price is required'],
        default: 0,
        min: 0,
    },
    currency: {
        type: String,
        default: 'USD',
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true,
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    xpReward: {
        type: Number,
        default: 0,
        min: 0,
    },
    prerequisites: [
        {
            type: String,
        }
    ],
    totalDuration: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: 1, // Start with something low if required, usually unrated or null is better, let's leave as 1 because of DB design currently
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});
// Compound Indexing for optimal queries
courseSchema.index({ status: 1, isDeleted: 1 });
courseSchema.index({ category: 1, level: 1 });
// Create a text index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Query Middleware to filter deleted
courseSchema.pre(/^find/, function () {
    this.where({ isDeleted: { $ne: true } });
});
// Middleware to automatically generate slug from title before saving
courseSchema.pre('validate', function () {
    if (this.isModified('title') && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9 ]/g, '') // remove special chars
            .replace(/\s+/g, '-');
    }
});
const Course = mongoose_1.default.model('Course', courseSchema);
exports.default = Course;
//# sourceMappingURL=courseModel.js.map