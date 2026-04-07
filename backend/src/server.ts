import express, { type Application, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000', // Assuming frontend will run on 3000
    credentials: true,
}));

// Basic Route for testing
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the CTC Club API' });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// For operations purely based on LessonId (Update, Delete a lesson)
app.use('/api/lessons', lessonRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
