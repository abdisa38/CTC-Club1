"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetCodeEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const getConfiguredTransport = () => {
    const host = process.env.SMTP_HOST;
    const portRaw = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !portRaw || !user || !pass) {
        throw new Error('Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    }
    const port = Number(portRaw);
    if (!Number.isFinite(port) || port <= 0) {
        throw new Error('SMTP_PORT must be a valid positive number.');
    }
    const secure = port === 465;
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
};
const sendPasswordResetCodeEmail = async (input) => {
    const { to, name, code, expiresInMinutes } = input;
    const transport = getConfiguredTransport();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@ctcclub.local';
    await transport.sendMail({
        from,
        to,
        subject: 'CTC Club password reset code',
        text: `Hi ${name},\n\nUse this code to reset your CTC Club password: ${code}\nThis code expires in ${expiresInMinutes} minutes.\n\nIf you did not request this reset, ignore this email.`,
        html: `<p>Hi ${name},</p><p>Use this code to reset your CTC Club password:</p><p style="font-size:24px;font-weight:700;letter-spacing:2px;">${code}</p><p>This code expires in ${expiresInMinutes} minutes.</p><p>If you did not request this reset, ignore this email.</p>`,
    });
};
exports.sendPasswordResetCodeEmail = sendPasswordResetCodeEmail;
//# sourceMappingURL=email.js.map