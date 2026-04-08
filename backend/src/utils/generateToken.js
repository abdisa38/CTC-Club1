"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (res, userId, role) => {
    const token = jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token;
};
const clearToken = (res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
};
exports.clearToken = clearToken;
exports.default = generateToken;
//# sourceMappingURL=generateToken.js.map