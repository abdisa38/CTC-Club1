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
exports.getUserProfile = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const generateToken_1 = __importStar(require("../utils/generateToken"));
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await userModel_1.default.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    // Hardcode "student" so anonymous public API cannot create admin
    const user = await userModel_1.default.create({
        name,
        email,
        password,
        role: 'student',
    });
    if (user) {
        (0, generateToken_1.default)(res, user._id.toString(), user.role);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel_1.default.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        (0, generateToken_1.default)(res, user._id.toString(), user.role);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    }
    else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});
// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logoutUser = (0, express_async_handler_1.default)(async (req, res) => {
    (0, generateToken_1.clearToken)(res);
    res.status(200).json({ message: 'Logged out successfully' });
});
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await userModel_1.default.findById(req.user._id).select('-password');
    if (user) {
        res.json(user);
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
//# sourceMappingURL=authController.js.map