import express, { type Application, type Request, type Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
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

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();

// Body parser
app.use(express.json());

// Serve uploaded lesson assets
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.CLIENT_URL || '',
    ].filter(Boolean),
    credentials: true,
}));

// Basic Route for testing
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the CTC Club API' });
});
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

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
