import express, { type Application, type Request, type Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { sanitizeRequest } from './middleware/securityMiddleware';
import { logger } from './utils/logger';
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

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();

app.disable('x-powered-by');
if (env.trustProxy) {
    app.set('trust proxy', 1);
}

const allowedOrigins = new Set<string>([
    'http://localhost:5173',
    'http://localhost:3000',
    env.clientUrl,
    ...env.corsAllowedOrigins,
]);

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser clients (curl/postman) that don't send Origin.
        if (!origin) {
            callback(null, true);
            return;
        }

        if (allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
};

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: env.requestBodyLimit }));
app.use(express.urlencoded({ extended: false, limit: env.requestBodyLimit }));
app.use(sanitizeRequest);

// Serve uploaded lesson assets
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Cookie parser
app.use(cookieParser());

// Basic Route for testing
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the CTC Club API' });
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

const PORT = env.port;

app.listen(PORT, () => {
    logger.info(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
});
