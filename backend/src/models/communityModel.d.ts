import mongoose, { Document } from 'mongoose';
export interface ICommunityPost extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    content: string;
    course?: mongoose.Types.ObjectId;
    category: 'general' | 'qna' | 'showcase' | 'announcement';
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
    views: number;
    tags: string[];
    isLocked: boolean;
    isPinned: boolean;
    isDeleted: boolean;
    repliesCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CommunityPost: mongoose.Model<ICommunityPost, {}, {}, {}, mongoose.Document<unknown, {}, ICommunityPost, {}, mongoose.DefaultSchemaOptions> & ICommunityPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICommunityPost>;
export interface ICommunityReply extends Document {
    post: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    content: string;
    isAcceptedAnswer: boolean;
    upvotes: mongoose.Types.ObjectId[];
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CommunityReply: mongoose.Model<ICommunityReply, {}, {}, {}, mongoose.Document<unknown, {}, ICommunityReply, {}, mongoose.DefaultSchemaOptions> & ICommunityReply & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICommunityReply>;
//# sourceMappingURL=communityModel.d.ts.map