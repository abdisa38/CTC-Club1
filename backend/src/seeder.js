"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const userModel_1 = __importDefault(require("./models/userModel"));
const courseModel_1 = __importDefault(require("./models/courseModel"));
const progressModel_1 = __importDefault(require("./models/progressModel"));
dotenv_1.default.config();
const importData = async () => {
    try {
        await (0, db_1.default)();
        console.log('Clearing existing dummy data...');
        await courseModel_1.default.deleteMany();
        await progressModel_1.default.deleteMany();
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
        const createdUsersByEmail = {};
        for (const user of users) {
            let existingUser = await userModel_1.default.findOne({ email: user.email });
            if (!existingUser) {
                existingUser = await userModel_1.default.create(user);
                console.log(`Created ${user.role}: ${user.email}`);
            }
            createdUsersByEmail[user.email] = existingUser;
        }
        const studentUser = createdUsersByEmail['amira@ctc.com'];
        const sarahUser = createdUsersByEmail['sarah@ctc.com'];
        const alexUser = createdUsersByEmail['alex@ctc.com'];
        if (!studentUser || !sarahUser || !alexUser) {
            throw new Error('Required seed users were not created successfully');
        }
        const sarahId = sarahUser._id;
        const alexId = alexUser._id;
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
            }
        ];
        const insertedCourses = await courseModel_1.default.insertMany(courses);
        console.log(`Imported ${insertedCourses.length} courses!`);
        // Optionally create some progress
        const firstCourse = insertedCourses[0];
        if (firstCourse) {
            await progressModel_1.default.create({
                user: studentUser._id,
                course: firstCourse._id,
                completedLessons: [],
                isCompleted: true
            });
            console.log('Seeded progress successfully.');
        }
        console.log('Data Imported!');
        process.exit();
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
importData();
//# sourceMappingURL=seeder.js.map