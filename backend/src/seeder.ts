import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import User from './models/userModel';
import Course from './models/courseModel';
import Progress from './models/progressModel';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing dummy data...');
    await Course.deleteMany();
    await Progress.deleteMany();

    const users = [
      {
        name: 'Amira Hassan',
        email: 'amira@ctc.com',
        password: 'password123',
        role: 'student',
      },
      {
        name: 'Dr. Sarah Chen',
        email: 'sarah@ctc.com',
        password: 'password123',
        role: 'instructor',
      },
      {
        name: 'Prof. Alex Rivera',
        email: 'alex@ctc.com',
        password: 'password123',
        role: 'instructor',
      }
    ];

    const createdUsers = [];
    for (const user of users) {
      let existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        existingUser = await User.create(user);
        console.log(`Created ${user.role}: ${user.email}`);
      }
      createdUsers.push(existingUser);
    }

    const sarahId = createdUsers[1]._id;
    const alexId = createdUsers[2]._id;

    console.log('Seeding courses...');
    const courses = [
      {
        title: "Complete Web Development Bootcamp",
        description: "Learn full-stack web development from scratch with HTML, CSS, JavaScript, React, Node, and MongoDB.",
        shortDescription: "Become a full-stack developer.",
        instructor: sarahId,
        coverImage: "https://images.unsplash.com/photo-1637937459053-c788742455be?w=600&h=340&fit=crop",
        category: "Development",
        price: 99,
        isPublished: true,
        status: "published",
        level: "beginner",
        rating: 4.9,
      },
      {
        title: "Graphic Design Fundamentals",
        description: "Master typography, color theory, layout, and essential design software like Figma and Illustrator.",
        shortDescription: "Learn to design beautifully.",
        instructor: alexId,
        coverImage: "https://images.unsplash.com/photo-1512645592367-97ba8a9d4035?w=600&h=340&fit=crop",
        category: "Design",
        price: 49,
        isPublished: true,
        status: "published",
        level: "beginner",
        rating: 4.8,
      },
      {
        title: "Data Science & Machine Learning",
        description: "Understand data analysis, pandas, numpy, scikit-learn, and build real AI models in Python.",
        shortDescription: "Machine learning for everyone.",
        instructor: sarahId,
        coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop",
        category: "Development",
        price: 149,
        isPublished: true,
        status: "published",
        level: "intermediate",
        rating: 4.9,
      },
      {
        title: "Mobile App Development with React Native",
        description: "Build cross-platform iOS and Android apps with a single codebase using React Native.",
        shortDescription: "Create native apps easily.",
        instructor: alexId,
        coverImage: "https://images.unsplash.com/photo-1760531932521-8eb5a064dbca?w=600&h=340&fit=crop",
        category: "Development",
        price: 129,
        isPublished: true,
        status: "published",
        level: "intermediate",
        rating: 4.7,
      }
    ];

    const insertedCourses = await Course.insertMany(courses);
    console.log(`Imported ${insertedCourses.length} courses!`);

    // Optionally create some progress
    await Progress.create({
      user: createdUsers[0]._id,
      course: insertedCourses[0]._id,
      completedLessons: [],
      isCompleted: true
    });
    console.log('Seeded progress successfully.');

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

importData();
