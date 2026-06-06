import 'dotenv/config';
import express, { type Application, type Request, type Response } from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import { getJwtSecret } from './config/env';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';
import quizRoutes from './routes/quizRoutes';
import projectRoutes from './routes/projectRoutes';
import supportRoutes from './routes/supportRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import communityRoutes from './routes/communityRoutes';
import notificationRoutes from './routes/notificationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import eventRoutes from './routes/eventRoutes';
import paymentRoutes from './routes/paymentRoutes';

const parseRateLimitMax = (value: string | undefined, fallback: number) => {
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

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseRateLimitMax(process.env.RATE_LIMIT_MAX, 500),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again in a few minutes.',
    },
});

const authRateLimiter = rateLimit({
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
connectDB();
getJwtSecret();

const app: Application = express();

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
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
app.use(express.json({ limit: '1mb' }));

// Serve uploaded lesson assets
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Cookie parser
app.use(cookieParser());

// Basic Route for testing
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the CTC Club API' });
});

app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

if (process.env.NODE_ENV === 'development') {
    app.get('/api/debug/routes/payments', (req: Request, res: Response) => {
        const stack = (paymentRoutes as any)?.stack || [];
        const routes = stack
            .filter((layer: any) => layer.route)
            .map((layer: any) => ({
                methods: Object.keys(layer.route.methods || {}).map((method) => method.toUpperCase()),
                path: layer.route.path,
            }));

        res.json({ routes });
    });
}
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
// For operations purely based on LessonId (Update, Delete a lesson)
app.use('/api/lessons', lessonRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 CTC Club API Server Started Successfully            ║
║                                                           ║
║   Environment: ${(process.env.NODE_ENV || 'development').toUpperCase().padEnd(11)}                             ║
║   Port:        ${String(PORT).padEnd(11)}                             ║
║   API URL:     http://localhost:${PORT}/api              ║
║   Health:      http://localhost:${PORT}/api/health       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close database connections
        import('mongoose').then(mongoose => {
            mongoose.default.connection.close(false).then(() => {
                console.log('✅ MongoDB connection closed');
                process.exit(0);
            });
        });
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in production, just log
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    // Exit immediately for uncaught exceptions
    process.exit(1);
});

export default app;
