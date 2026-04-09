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
const lessonSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Lesson title is required'],
        trim: true,
        maxlength: [100, 'Lesson title cannot exceed 100 characters'],
    },
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true,
    },
    chapter: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Chapter', // Can create a Chapter model later if needed, or simply string grouping
        index: true,
    },
    content: {
        type: String,
        required: [true, 'Lesson content is required'],
    },
    videoUrl: {
        type: String, // Supports YouTube, Vimeo, AWS S3
    },
    duration: {
        type: Number,
        default: 0,
        min: 0,
    },
    order: {
        type: Number,
        default: 0,
        index: true, // Optimizes ordered find
    },
    attachments: [
        {
            title: String,
            url: String,
            fileType: String,
        }
    ],
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
    },
    isFreePreview: {
        type: Boolean,
        default: false,
    },
    xpReward: {
        type: Number,
        default: 0,
        min: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});
// Compound Indexing for optimal queries inside course
lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ course: 1, isPublished: 1, isDeleted: 1 });
// Automatically update Course total duration on save? Handled via service/controller
// Query Middleware to automatically filter out soft-deleted lessons
lessonSchema.pre(/^find/, function () {
    this.where({ isDeleted: { $ne: true } });
});
const Lesson = mongoose_1.default.model('Lesson', lessonSchema);
exports.default = Lesson;
//# sourceMappingURL=lessonModel.js.map