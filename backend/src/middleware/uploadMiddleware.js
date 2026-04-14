"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResourceUpload = exports.handleVideoUpload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const MB = 1024 * 1024;
const parseUploadLimitMb = (envName, fallbackMb, minMb = 1, maxMb = 2048) => {
    const raw = Number(process.env[envName] || fallbackMb);
    if (!Number.isFinite(raw)) {
        return fallbackMb * MB;
    }
    const bounded = Math.min(maxMb, Math.max(minMb, Math.floor(raw)));
    return bounded * MB;
};
const VIDEO_UPLOAD_LIMIT_BYTES = parseUploadLimitMb('VIDEO_UPLOAD_MAX_MB', 512);
const RESOURCE_UPLOAD_LIMIT_BYTES = parseUploadLimitMb('RESOURCE_UPLOAD_MAX_MB', 50);
const uploadDir = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const originalExt = path_1.default.extname(file.originalname || '');
        const originalBase = path_1.default.basename(file.originalname || 'file', originalExt);
        const safeBase = originalBase.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-');
        const finalBase = safeBase || 'file';
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1e9);
        cb(null, `${timestamp}-${random}-${finalBase}${originalExt}`);
    },
});
const videoUploader = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: VIDEO_UPLOAD_LIMIT_BYTES,
    },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('video/')) {
            cb(new Error('Only video files are allowed for lesson videos'));
            return;
        }
        cb(null, true);
    },
});
const resourceUploader = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: RESOURCE_UPLOAD_LIMIT_BYTES,
    },
});
const handleVideoUpload = (req, res, next) => {
    videoUploader.single('video')(req, res, (err) => {
        if (err) {
            res.status(err?.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
            next(err);
            return;
        }
        next();
    });
};
exports.handleVideoUpload = handleVideoUpload;
const handleResourceUpload = (req, res, next) => {
    resourceUploader.single('resource')(req, res, (err) => {
        if (err) {
            res.status(err?.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
            next(err);
            return;
        }
        next();
    });
};
exports.handleResourceUpload = handleResourceUpload;
//# sourceMappingURL=uploadMiddleware.js.map