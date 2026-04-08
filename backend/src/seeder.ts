import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import User from './models/userModel';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    const users = [
      {
        name: 'Admin User',
        email: 'admin@ctc.com',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Instructor User',
        email: 'instructor@ctc.com',
        password: 'password123',
        role: 'instructor',
      },
      {
        name: 'Student User',
        email: 'student@ctc.com',
        password: 'password123',
        role: 'student',
      }
    ];

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create(user);
        console.log(`Created ${user.role}: ${user.email}`);
      } else {
        console.log(`${user.role} already exists: ${user.email}`);
      }
    }

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

importData();