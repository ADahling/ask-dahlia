"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHmacSignature = createHmacSignature;
exports.verifyHmacSignature = verifyHmacSignature;
const crypto_1 = __importDefault(require("crypto"));
function createHmacSignature(payload, secret) {
    const hmac = crypto_1.default.createHmac('sha256', secret);
    hmac.update(payload);
    return hmac.digest('hex');
}
function verifyHmacSignature(payload, signature, secret) {
    const expectedSignature = createHmacSignature(payload, secret);
    return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
