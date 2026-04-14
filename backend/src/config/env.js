"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoUri = exports.getJwtSecret = void 0;
require("dotenv/config");
const crypto_1 = __importDefault(require("crypto"));
const isProduction = process.env.NODE_ENV === 'production';
const readEnv = (key) => String(process.env[key] || '').trim();
const requireEnv = (key) => {
    const value = readEnv(key);
    if (!value) {
        throw new Error(`[env] Missing required environment variable: ${key}`);
    }
    return value;
};
const devJwtSecret = `dev-only-jwt-secret-${crypto_1.default.randomUUID()}`;
let warnedAboutDevJwtFallback = false;
const getJwtSecret = () => {
    const configuredSecret = readEnv('JWT_SECRET');
    if (configuredSecret) {
        return configuredSecret;
    }
    if (isProduction) {
        throw new Error('[env] Missing required environment variable: JWT_SECRET');
    }
    if (!warnedAboutDevJwtFallback) {
        warnedAboutDevJwtFallback = true;
        console.warn('[security] JWT_SECRET is not set. Using a temporary development secret for this process only.');
    }
    return devJwtSecret;
};
exports.getJwtSecret = getJwtSecret;
const getMongoUri = () => requireEnv('MONGO_URI');
exports.getMongoUri = getMongoUri;
//# sourceMappingURL=env.js.map