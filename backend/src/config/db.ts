import mongoose from 'mongoose';
import { getMongoUri } from './env';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(getMongoUri());
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
