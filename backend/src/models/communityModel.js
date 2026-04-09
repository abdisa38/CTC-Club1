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
exports.CommunityReply = exports.CommunityPost = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const communityPostSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Post title is required'], trim: true },
    content: { type: String, required: [true, 'Post content is required'] },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', index: true },
    category: {
        type: String,
        enum: ['general', 'qna', 'showcase', 'announcement'],
        default: 'general',
        index: true
    },
    upvotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    isLocked: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
    repliesCount: { type: Number, default: 0 }
}, { timestamps: true });
communityPostSchema.index({ category: 1, isDeleted: 1 });
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
communityPostSchema.pre(/^find/, function () {
    this.where({ isDeleted: { $ne: true } });
});
exports.CommunityPost = mongoose_1.default.model('CommunityPost', communityPostSchema);
const communityReplySchema = new mongoose_1.Schema({
    post: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: [true, 'Reply content is required'] },
    isAcceptedAnswer: { type: Boolean, default: false, index: true },
    upvotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });
communityReplySchema.pre(/^find/, function () {
    this.where({ isDeleted: { $ne: true } });
});
exports.CommunityReply = mongoose_1.default.model('CommunityReply', communityReplySchema);
//# sourceMappingURL=communityModel.js.map