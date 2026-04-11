"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
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
// Load env vars
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
// Body parser
app.use(express_1.default.json());
// Serve uploaded lesson assets
app.use('/uploads', express_1.default.static(path_1.default.resolve(process.cwd(), 'uploads')));
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Enable CORS
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.CLIENT_URL || '',
    ].filter(Boolean),
    credentials: true,
}));
// Basic Route for testing
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the CTC Club API' });
});
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