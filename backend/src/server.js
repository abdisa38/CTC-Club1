"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
const env_1 = require("./config/env");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const lessonRoutes_1 = __importDefault(require("./routes/lessonRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const communityRoutes_1 = __importDefault(require("./routes/communityRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const parseRateLimitMax = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.floor(parsed);
};
const getAllowedOrigins = () => {
    const envOrigins = String(process.env.CORS_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    return Array.from(new Set([
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.CLIENT_URL || '',
        ...envOrigins,
    ].filter(Boolean)));
};
const corsOriginSet = new Set(getAllowedOrigins());
const apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: parseRateLimitMax(process.env.RATE_LIMIT_MAX, 500),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again in a few minutes.',
    },
});
const authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: parseRateLimitMax(process.env.AUTH_RATE_LIMIT_MAX, 20),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please wait and try again.',
    },
});
// Connect to database
(0, db_1.default)();
(0, env_1.getJwtSecret)();
const app = (0, express_1.default)();
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
app.disable('x-powered-by');
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || corsOriginSet.has(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('CORS policy blocked this request origin.'));
    },
    credentials: true,
}));
app.use('/api', apiRateLimiter);
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/password/forgot', authRateLimiter);
app.use('/api/auth/password/reset', authRateLimiter);
// Body parser
app.use(express_1.default.json({ limit: '1mb' }));
// Serve uploaded lesson assets
app.use('/uploads', express_1.default.static(path_1.default.resolve(__dirname, '..', 'uploads')));
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Basic Route for testing
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the CTC Club API' });
});
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});
if (process.env.NODE_ENV === 'development') {
    app.get('/api/debug/routes/payments', (req, res) => {
        const stack = paymentRoutes_1.default?.stack || [];
        const routes = stack
            .filter((layer) => layer.route)
            .map((layer) => ({
            methods: Object.keys(layer.route.methods || {}).map((method) => method.toUpperCase()),
            path: layer.route.path,
        }));
        res.json({ routes });
    });
}
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/quizzes', quizRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/support', supportRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/community', communityRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
app.use('/api/events', eventRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
// For operations purely based on LessonId (Update, Delete a lesson)
app.use('/api/lessons', lessonRoutes_1.default);
// Error handling middleware
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
//# sourceMappingURL=server.js.map