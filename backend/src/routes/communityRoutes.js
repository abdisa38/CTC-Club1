"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const communityController_1 = require("../controllers/communityController");
const router = express_1.default.Router();
router.get('/posts', authMiddleware_1.protect, communityController_1.getCommunityPosts);
router.post('/posts', authMiddleware_1.protect, communityController_1.createCommunityPost);
router.post('/posts/:postId/vote', authMiddleware_1.protect, communityController_1.voteCommunityPost);
router.get('/posts/:postId/replies', authMiddleware_1.protect, communityController_1.getCommunityReplies);
router.post('/posts/:postId/replies', authMiddleware_1.protect, communityController_1.addCommunityReply);
exports.default = router;
//# sourceMappingURL=communityRoutes.js.map