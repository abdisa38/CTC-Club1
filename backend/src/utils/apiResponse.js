"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = (res, data, options = {}) => {
    const { statusCode = 200, message, meta } = options;
    return res.status(statusCode).json({
        success: true,
        ...(message ? { message } : {}),
        data,
        ...(meta ? { meta } : {}),
    });
};
exports.sendSuccess = sendSuccess;
//# sourceMappingURL=apiResponse.js.map