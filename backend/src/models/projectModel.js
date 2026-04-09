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
exports.ProjectSubmission = exports.Project = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const projectSchema = new mongoose_1.Schema({
    title: { type: String, required: [true, 'Project title is required'], trim: true },
    description: { type: String, required: [true, 'Project description is required'], trim: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lesson', index: true },
    instructions: { type: String, default: '' },
    requirements: [{ type: String }],
    xpReward: { type: Number, default: 50, min: 0 },
    maxPoints: { type: Number, default: 100, min: 1 },
    deadline: { type: Date },
    isPublished: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });
projectSchema.pre(/^find/, function () {
    this.where({ isDeleted: { $ne: true } });
});
exports.Project = mongoose_1.default.model('Project', projectSchema);
const projectSubmissionSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    repoUrl: { type: String },
    liveUrl: { type: String },
    files: [{ type: String }], // Array of URLs to files
    comments: { type: String }, // Student comments on submission
    grade: { type: Number, min: 0 },
    feedback: { type: String },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'under_review', 'graded'],
        default: 'submitted',
        index: true
    },
    xpEarned: { type: Number, default: 0 }
}, { timestamps: true });
// One submission per project per student (can be updated, but not duplicated unless we add attempt counter)
projectSubmissionSchema.index({ student: 1, project: 1 }, { unique: true });
exports.ProjectSubmission = mongoose_1.default.model('ProjectSubmission', projectSubmissionSchema);
//# sourceMappingURL=projectModel.js.map