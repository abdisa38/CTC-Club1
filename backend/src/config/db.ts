import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);
        mongoose.set('sanitizeFilter', true);

        const conn = await mongoose.connect(env.mongoUri);
        logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (error: any) {
        logger.error('MongoDB connection failed', error?.message || error);
        process.exit(1);
    }
};

export default connectDB;
