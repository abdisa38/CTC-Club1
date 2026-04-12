"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const paymentTransactionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    txRef: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 1,
    },
    currency: {
        type: String,
        required: true,
        default: 'ETB',
        enum: ['ETB'],
    },
    status: {
        type: String,
        required: true,
        default: 'initialized',
        enum: ['initialized', 'pending', 'success', 'failed', 'cancelled'],
        index: true,
    },
    checkoutUrl: {
        type: String,
        trim: true,
    },
    chapaReference: {
        type: String,
        trim: true,
    },
    paymentReference: {
        type: String,
        trim: true,
    },
    paymentMethod: {
        type: String,
        trim: true,
    },
    verifiedAt: {
        type: Date,
    },
    paidAt: {
        type: Date,
    },
    rawInitializeResponse: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    rawVerifyResponse: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    rawWebhookPayload: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
paymentTransactionSchema.index({ user: 1, createdAt: -1 });
const PaymentTransaction = mongoose_1.default.model('PaymentTransaction', paymentTransactionSchema);
exports.default = PaymentTransaction;
//# sourceMappingURL=paymentTransactionModel.js.map