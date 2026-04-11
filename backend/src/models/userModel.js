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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false, // Security: don't return password by default
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student',
        index: true,
    },
    avatar: {
        type: String,
        default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    badges: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Badge',
        }],
    isDeleted: {
        type: Boolean,
        default: false,
        index: true, // For quicker filtering
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
    },
    enrolledCourses: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Course',
        }],
    createdCourses: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Course',
        }],
    favoriteCourses: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Course',
            index: true,
        }],
}, {
    timestamps: true, // adds createdAt and updatedAt
});
// Indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ xp: -1 });
// Query Middleware to automatically filter out soft-deleted users
userSchema.pre(/^find/, function () {
    this.where({ isDeleted: { $ne: true } });
});
// Method to verify passwords on login
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Because password is select: false, we need to explicitly query it if it's not present
    if (!this.password) {
        const user = await mongoose_1.default.model('User').findById(this._id).select('+password');
        if (!user || !user.password)
            return false;
        return await bcrypt_1.default.compare(enteredPassword, user.password);
    }
    return await bcrypt_1.default.compare(enteredPassword, this.password);
};
// Middleware to hash passwords before saving them
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    else {
        const salt = await bcrypt_1.default.genSalt(10);
        this.password = await bcrypt_1.default.hash(this.password, salt);
    }
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=userModel.js.map