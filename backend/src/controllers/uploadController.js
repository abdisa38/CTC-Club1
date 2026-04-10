"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLessonResource = exports.uploadLessonVideo = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const buildPublicUrl = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};
const uploadLessonVideo = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded' });
    }
    return (0, apiResponse_1.sendSuccess)(res, {
        url: buildPublicUrl(req, req.file.filename),
        fileType: req.file.mimetype,
        size: req.file.size,
        originalName: req.file.originalname,
        filename: req.file.filename,
    }, { message: 'Video uploaded successfully' });
};
exports.uploadLessonVideo = uploadLessonVideo;
const uploadLessonResource = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No resource file uploaded' });
    }
    return (0, apiResponse_1.sendSuccess)(res, {
        url: buildPublicUrl(req, req.file.filename),
        fileType: req.file.mimetype,
        size: req.file.size,
        originalName: req.file.originalname,
        filename: req.file.filename,
    }, { message: 'Resource uploaded successfully' });
};
exports.uploadLessonResource = uploadLessonResource;
//# sourceMappingURL=uploadController.js.map